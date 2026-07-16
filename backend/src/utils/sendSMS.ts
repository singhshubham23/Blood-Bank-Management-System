import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;

function normalizePhoneNumber(input: string): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;

  // Preserve already formatted E.164 numbers.
  if (raw.startsWith("+")) {
    const digits = raw.replace(/[^\d+]/g, "");
    return /^\+\d{8,15}$/.test(digits) ? digits : null;
  }

  // Strip non-digits and apply a default country code for local numbers.
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return null;

  const defaultCountryCode = process.env.DEFAULT_PHONE_COUNTRY_CODE || "+91";
  if (digitsOnly.length === 10) return `${defaultCountryCode}${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return `${defaultCountryCode}${digitsOnly.slice(1)}`;
  }
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  return null;
}

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

  const normalizedTo = normalizePhoneNumber(to);
  if (!normalizedTo) {
    console.warn(`[Twilio] Skipping invalid recipient number: ${to}`);
    return null;
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    console.warn("[Twilio] TWILIO_PHONE_NUMBER not set — SMS skipped");
    return null;
  }

  try {
    const message = await client.messages.create({ body, from, to: normalizedTo });
    console.log(`[Twilio] SMS sent → ${normalizedTo} (SID: ${message.sid})`);
    return message;
  } catch (err: any) {
    console.error(`[Twilio] SMS failed → ${normalizedTo}:`, err.message);
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
