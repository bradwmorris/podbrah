'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  EdgeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  getStraightPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabaseAuth } from '@/lib/supabaseAuth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from '@/components/header';

interface FeedItem {
  id: number;
  user_id: string;
  podcast_id: number;
  podcast_title: string;
  twin_name: string;
  avatar_url: string | null;
  created_at: string;
  why_listen: string;
  podcast_link: string;
}

interface UserNodeData {
  twin_name: string;
  avatar_url: string | null;
}

interface PodcastEdgeData {
  podcast_title: string;
  thumbnail_url: string;
  why_listen: string;
}

const extractYouTubeId = (url: string): string | null => {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /^[a-zA-Z0-9_-]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
};

const getPodcastThumbnail = (podcastLink: string): string | null => {
  if (!podcastLink) return null;
  const youtubeId = extractYouTubeId(podcastLink);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
};

// Custom Node Component
const UserNode = ({ data }: NodeProps<UserNodeData>) => {
  return (
    <div className="bg-[#1E1E1E] rounded-full p-1 border-2 border-ctaGreen">
      <Handle type="source" position={Position.Top} style={{ visibility: 'hidden' }} />
      <Handle type="target" position={Position.Bottom} style={{ visibility: 'hidden' }} />
      <Avatar className="w-12 h-12">
        <AvatarImage src={data.avatar_url || ''} alt={data.twin_name} />
        <AvatarFallback>{data.twin_name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white">
        {data.twin_name}
      </div>
    </div>
  );
};

// Custom Edge Component
const PodcastEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data
}: EdgeProps<PodcastEdgeData>) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  });

  return (
    <>
      <path
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#12B76A"
        strokeOpacity={0.5}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && data && (
        <foreignObject
          x={sourceX + (targetX - sourceX) / 2 - 100}
          y={sourceY + (targetY - sourceY) / 2 - 60}
          width={200}
          height={120}
          className="overflow-visible"
        >
          <div className="bg-[#1E1E1E] rounded-lg p-3 shadow-lg border border-ctaGreen/30">
            <img
              src={data.thumbnail_url}
              alt={data.podcast_title}
              className="w-full h-24 object-cover rounded mb-2"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (img.src.includes('maxresdefault')) {
                  img.src = img.src.replace('maxresdefault', 'hqdefault');
                }
              }}
            />
            <p className="text-xs text-gray-300 line-clamp-2">{data.why_listen}</p>
          </div>
        </foreignObject>
      )}
    </>
  );
};

const nodeTypes = {
  user: UserNode
};

const edgeTypes = {
  podcast: PodcastEdge
};

export default function MapPage() {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processData = useCallback((feedItems: FeedItem[]) => {
    // Create nodes (users)
    const uniqueUsers = new Map();
    feedItems.forEach(item => {
      if (!uniqueUsers.has(item.user_id)) {
        uniqueUsers.set(item.user_id, {
          id: item.user_id,
          type: 'user',
          position: { 
            x: Math.random() * 800, 
            y: Math.random() * 600 
          },
          data: {
            twin_name: item.twin_name,
            avatar_url: item.avatar_url
          }
        });
      }
    });

    const newNodes = Array.from(uniqueUsers.values());
    const newEdges: Edge[] = [];
    const processedPairs = new Set();

    feedItems.forEach(item1 => {
      feedItems.forEach(item2 => {
        if (
          item1.user_id !== item2.user_id && 
          item1.podcast_id === item2.podcast_id
        ) {
          const pairKey = [item1.user_id, item2.user_id].sort().join('-');
          if (!processedPairs.has(pairKey)) {
            const thumbnail = getPodcastThumbnail(item1.podcast_link);
            newEdges.push({
              id: `${item1.user_id}-${item2.user_id}-${item1.podcast_id}`,
              source: item1.user_id,
              target: item2.user_id,
              type: 'podcast',
              data: {
                podcast_title: item1.podcast_title,
                thumbnail_url: thumbnail || '',
                why_listen: item1.why_listen
              }
            });
            processedPairs.add(pairKey);
          }
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  useEffect(() => {
    const loadFeedData = async () => {
      try {
        setLoading(true);
        const { data, error: queryError } = await supabaseAuth
          .from('feed')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;
        if (data) {
          processData(data);
        }
      } catch (err) {
        console.error('Error loading feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadFeedData();
  }, [processData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse text-lg">Loading map...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Header />
      <div style={{ width: '100vw', height: 'calc(100vh - 64px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}