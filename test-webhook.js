const fetch = require('node-fetch');

const N8N_WEBHOOK_URL = "https://hcwaif.app.n8n.cloud/webhook-test/4dbd5440-f4c7-4b03-9b1d-8c23b346c8c6";

async function testWebhook() {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "Test message",
        sessionId: "test-session"
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Webhook response:", responseText);
  } catch (error) {
    console.error("Error triggering webhook:", error);
  }
}

testWebhook();