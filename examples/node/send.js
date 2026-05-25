const API_URL = process.env.HYPERMSG_URL || "http://localhost:4000";
const API_TOKEN = process.env.HYPERMSG_TOKEN;
const INSTANCE_ID = process.env.HYPERMSG_INSTANCE_ID;

async function sendText() {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      instanceId: INSTANCE_ID,
      to: "+15551234567",
      body: "Hello from Node.js"
    })
  });
  console.log(await response.json());
}

sendText().catch((err) => {
  console.error(err);
  process.exit(1);
});
