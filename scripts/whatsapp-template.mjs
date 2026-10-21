// Creates (or checks) the "new_lead_alert" WhatsApp template that lib/whatsapp.ts sends.
// Needs WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID in .env.local. Run: pnpm whatsapp:template
try {
  process.loadEnvFile(".env.local");
} catch {}

const GRAPH = "https://graph.facebook.com/v25.0";
const NAME = "new_lead_alert";
const { WHATSAPP_TOKEN: token, WHATSAPP_BUSINESS_ACCOUNT_ID: waba } = process.env;
if (!token || !waba) {
  console.error("Set WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID in .env.local first.");
  process.exit(1);
}

const api = async (path, init) => {
  const res = await fetch(`${GRAPH}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json.error ?? json));
  return json;
};

const existing = await api(`${waba}/message_templates?name=${NAME}&fields=name,status,rejected_reason`);
if (existing.data?.length) {
  for (const t of existing.data) console.log(`${t.name}: ${t.status}${t.rejected_reason && t.rejected_reason !== "NONE" ? ` (${t.rejected_reason})` : ""}`);

  // `pnpm whatsapp:template test` sends a sample alert to LEAD_ALERT_PHONE.
  if (process.argv[2] === "test") {
    const { WHATSAPP_PHONE_NUMBER_ID: phoneId, LEAD_ALERT_PHONE: to } = process.env;
    if (!phoneId || !to) throw new Error("Set WHATSAPP_PHONE_NUMBER_ID and LEAD_ALERT_PHONE in .env.local first.");
    const sample = ["Test Lead (Acme)", "Hackathon, 80 people, Thu, Nov 12, Brooklyn Navy Yard", "+19175550101", "https://www.vibecodedcoffee.com/admin/pipeline"];
    const sent = await api(`${phoneId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "template",
        template: { name: NAME, language: { code: "en_US" }, components: [{ type: "body", parameters: sample.map((text) => ({ type: "text", text })) }] },
      }),
    });
    console.log(`Test sent to ${to} (message ${sent.messages?.[0]?.id}).`);
  }
  process.exit(0);
}

const created = await api(`${waba}/message_templates`, {
  method: "POST",
  body: JSON.stringify({
    name: NAME,
    language: "en_US",
    category: "UTILITY",
    components: [
      {
        type: "BODY",
        text: "New catering lead from the website: {{1}}\n\nEvent: {{2}}\nCall them: {{3}}\nPipeline: {{4}}\n\nCall within 5 minutes for the best chance to book.",
        example: {
          body_text: [["Dana Lee (Acme)", "Hackathon, 80 people, Thu, Nov 12, Brooklyn Navy Yard", "+19175550101", "https://www.vibecodedcoffee.com/admin/pipeline"]],
        },
      },
    ],
  }),
});
console.log(`Submitted ${NAME}: ${created.status} (id ${created.id}). Approval usually takes a few minutes; rerun to check.`);
