import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getRelevantPodcastContent(podcastId: string) {
  const { data: overviewData, error: overviewError } = await supabase
    .from('overview_embed')
    .select('metadata')
    .eq('metadata->>podcast_id', podcastId)
    .single();

  if (overviewError) {
    console.error('Error fetching overview:', overviewError);
    return '';
  }

  return overviewData?.metadata || '';
}

function generateSystemPrompt(stage: string, theme: any, podcastContext: string, name: string): string {
  const baseContext = `You are ${name}'s witty, conversational digital twin. Your goal is to help them articulate why this podcast conversation was valuable and important.

Available Context:
1. User's previous theme explanations: ${theme.userExplanation}
2. RAG database content (podcast metadata): ${podcastContext}
3. Current stage: ${stage}

Primary Objective: Get the user to elaborate on why they found this conversation valuable and important at a high level.`;

  const stagePrompts = {
    discussion: `Your conversation style:
- Use casual, friendly language
- Keep responses short (2-3 sentences max)
- Ask thoughtful socratic questions that prompt deeper reflection
- Reference their previous responses when relevant
- Draw from the RAG database to enrich the discussion
- Focus on getting them to articulate the high-level value/importance

Examples of good responses:
"Yeah but why do you think that matters in the bigger picture?"
"Interesting... how would that change things if more people understood it?"
"That's a cool take. What made you arrive at that conclusion?"

Remember to:
1. Keep building on their previous responses
2. Help them articulate the broader significance
3. Use the RAG data to enrich the conversation`,

    synthesis: `Create a punchy, compelling synthesis that captures:
1. Their key insights about why the conversation was valuable
2. The broader significance they've identified
3. Why others should care about these ideas

Keep it casual but impactful - max 3 sentences.`,
  };

  return `${baseContext}

${stagePrompts[stage as keyof typeof stagePrompts] || ''}

Key Rules:
- Stay conversational and friendly
- Keep responses brief
- Focus on high-level value/importance
- Build on their responses
- Use RAG data thoughtfully`;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { message, sessionId, podcastId, name, themeContext } = await req.json();

    if (!message || !sessionId || !podcastId || !themeContext) {
      console.error('Missing parameters:', { message, sessionId, podcastId, themeContext });
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const podcastContext = await getRelevantPodcastContent(podcastId.toString());

    console.log('Processing request:', {
      stage: themeContext.stage,
      hasContext: !!podcastContext,
      messageLength: message.length
    });

    const systemPrompt = generateSystemPrompt(
      themeContext.stage,
      themeContext.currentTheme,
      podcastContext,
      name
    );

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,  // Kept short for punchy responses
      temperature: 0.85,  // Maintained for personality
    });

    const aiResponse = response.choices[0].message?.content?.trim() || 'Sorry, I couldn\'t generate a response.';

    console.log('Generated response:', {
      length: aiResponse.length,
      stage: themeContext.stage
    });

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
    return NextResponse.json({ 
      error: 'An error occurred while processing your request. Please try again.',
      details: error.message 
    }, { 
      status: 500 
    });
  }
}