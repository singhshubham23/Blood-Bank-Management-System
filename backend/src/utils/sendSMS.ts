import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn("[Twilio] Credentials not configured — SMS disabled");
    return null;
  }

  try {
    twilioClient = twilio(sid, token);
    console.log("[Twilio] Client initialised");
    return twilioClient;
  } catch (err: any) {
    console.error("[Twilio] Initialisation error:", err.message);
    return null;
  }
}

export async function sendSMS(to: string, body: string): Promise<any | null> {
  const client = getClient();
  if (!client) return null;

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn("[Twilio] TWILIO_PHONE_NUMBER not set — SMS skipped");
    return null;
  }

  try {
    const message = await client.messages.create({ body, from, to });
    console.log(`[Twilio] SMS sent → ${to} (SID: ${message.sid})`);
    return message;
  } catch (err: any) {
    console.error(`[Twilio] SMS failed → ${to}:`, err.message);
    return null;
  }
}

export async function sendBulkSMS(numbers: string[], body: string): Promise<void> {
  if (!numbers.length) return;

  const client = getClient();
  if (!client) return;

  console.log(`[Twilio] Sending bulk SMS to ${numbers.length} recipients…`);

  const BATCH = 10;
  for (let i = 0; i < numbers.length; i += BATCH) {
    const batch = numbers.slice(i, i + BATCH);
    await Promise.allSettled(batch.map((num) => sendSMS(num, body)));
  }

  console.log(`[Twilio] Bulk SMS complete`);
}
