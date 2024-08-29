import OpenAI from 'openai';
import { StreamingTextResponse } from 'ai';

console.log('Full process.env:', process.env);
console.log('OPENAI_API_KEY in route:', process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ASSISTANT_ID = "asst_PEmD7SItZ4Gjjpfm2Df8QNSI";

export const runtime = 'edge';

export async function POST(req: Request) {
  console.log('POST request received');
  console.log('OpenAI instance:', openai);
  console.log('API Key being used:', openai.apiKey);
  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);
    const lastMessage = messages[messages.length - 1];

    console.log('Creating thread...');
    const thread = await openai.beta.threads.create();
    console.log('Thread created:', thread.id);

    console.log('Adding message to thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: lastMessage.content
    });
    console.log('Message added to thread');

    console.log('Running assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID,
    });
    console.log('Assistant run created:', run.id);

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Retrieve the assistant's messages
    const messageList = await openai.beta.threads.messages.list(thread.id);

    // Get the last message from the assistant
    const lastAssistantMessage = messageList.data
      .filter(message => message.role === 'assistant')
      .pop();

    if (lastAssistantMessage && lastAssistantMessage.content[0].type === 'text') {
      console.log('Assistant response:', lastAssistantMessage.content[0].text.value);
      return new Response(lastAssistantMessage.content[0].text.value);
    } else {
      console.log('No response from assistant');
      return new Response('No response from assistant', { status: 500 });
    }
  } catch (error) {
    console.error('Error in POST function:', error);
    return new Response(
      'Error: ' + (error instanceof Error ? error.message : 'An unknown error occurred'), 
      { status: 500 }
    );
  }
}