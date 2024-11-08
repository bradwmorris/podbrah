import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { chapters } = await req.json();

    if (!chapters || !Array.isArray(chapters)) {
      return NextResponse.json({ error: 'Chapters array is required.' }, { status: 400 });
    }

    const gists = await Promise.all(chapters.map(async (chapter) => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides extremely concise chapter gists in less than 30 words."
          },
          {
            role: "user",
            content: `Provide an extremely simple explanation (gist) of this chapter in less than 30 words:\n\nTitle: ${chapter.chapter_title}\nSummary: ${chapter.summary}`
          }
        ],
        max_tokens: 50,
        temperature: 0.7,
      });

      return response.choices[0].message?.content?.trim() || 'No gist generated.';
    }));

    return NextResponse.json({ gists });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}