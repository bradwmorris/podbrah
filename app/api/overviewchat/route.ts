// app/api/overviewchat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MatchResult {
  id: number;
  content: string;
  metadata: any;
  similarity: number;
}

function generateSystemPrompt(stage: string, theme: any, context: string, name: string): string {
  const baseContext = `You are H.C. Waif, an AI assistant discussing the theme: "${theme.theme_title}".
Theme description: ${theme.theme_gist}
Context from podcast: ${context}
Current stage: ${stage}`;

  const stagePrompts = {
    introduction: `Keep the conversation flowing naturally about ${theme.theme_title}. Don't introduce yourself again - you've already met ${name}. Focus on understanding their perspective and encouraging deeper exploration of the theme.`,
    
    understanding: `Help validate and deepen their understanding of ${theme.theme_title}. Reference specific points from the podcast content when relevant.`,
    
    validation: `Analyze their understanding of ${theme.theme_title} against the podcast content. Provide constructive feedback and guide them towards a complete understanding.`,
    
    articulation: `Help them articulate ${theme.theme_title} in their own words. Encourage personal connections and practical applications.`,
    
    transition: `Wrap up the discussion of ${theme.theme_title} and prepare to move to the next theme. Summarize key insights before moving forward.`
  };

  return `${baseContext}

${stagePrompts[stage as keyof typeof stagePrompts]}

Remember: 
- Don't re-introduce yourself or greet them again
- Stay focused on the current theme and stage
- Maintain conversation flow
- Be concise but insightful
- Guide the user through natural exploration of the theme`;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { message, sessionId, podcastId, name, themeContext } = await req.json();

    if (!message || !sessionId || !podcastId || !themeContext) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log('Received request:', { message, sessionId, podcastId, name, themeContext });

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data: relevantContent, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.78,
      match_count: 5,
      podcast_id: podcastId.toString()
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error('Failed to fetch relevant content: ' + error.message);
    }

    if (!relevantContent || relevantContent.length === 0) {
      console.error('No relevant content found for podcast_id:', podcastId);
      throw new Error('No relevant content found');
    }

    const context = (relevantContent as MatchResult[]).map(item => item.content).join('\n');
    
    const systemPrompt = generateSystemPrompt(
      themeContext.stage,
      themeContext.currentTheme,
      context,
      name
    );

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message?.content?.trim() || 'Sorry, I couldn\'t generate a response.';

    console.log('AI Response:', aiResponse);

    return NextResponse.json({ 
      output: aiResponse,
      progress: {
        currentTheme: themeContext.progress.currentTheme,
        totalThemes: themeContext.progress.totalThemes,
        stage: themeContext.stage
      }
    });
  } catch (error: any) {
    console.error('Detailed error:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}