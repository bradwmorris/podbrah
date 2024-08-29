import { NextResponse } from 'next/server';

const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;
const AC_API_URL = process.env.ACTIVECAMPAIGN_API_URL;

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${AC_API_URL}/api/3/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Token': AC_API_KEY!,
      },
      body: JSON.stringify({
        contact: {
          email: email,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}