let session = localStorage.getItem("nextmsg_session");
let currentUser = JSON.parse(localStorage.getItem("nextmsg_user") || "null");

const authView = document.querySelector("#authView");
const dashboardView = document.querySelector("#dashboardView");
const authMessage = document.querySelector("#authMessage");
const appMessage = document.querySelector("#appMessage");

const codeExamples = {
  rest: `POST /messages/send HTTP/1.1
Host: localhost:4000
Authorization: Bearer nmsg_xxx
Content-Type: application/json

{
  "instanceId": "instance_uuid",
  "to": "+254700016642",
  "body": "Hello from NextMsg"
}`,
  curl: `curl -X POST http://localhost:4000/messages/send \\
  -H "Authorization: Bearer nmsg_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceId": "instance_uuid",
    "to": "+254700016642",
    "body": "Hello from NextMsg"
  }'`,
  node: `const response = await fetch("http://localhost:4000/messages/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer nmsg_xxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    instanceId: "instance_uuid",
    to: "+254700016642",
    body: "Hello from NextMsg"
  })
});

console.log(await response.json());`,
  javascript: `fetch("http://localhost:4000/messages/send", {
  method: "POST",
  headers: {
    "Authorization": "Bearer nmsg_xxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    instanceId: "instance_uuid",
    to: "+254700016642",
    body: "Hello from NextMsg"
  })
}).then((response) => response.json()).then(console.log);`,
  angular: `this.http.post(
  "http://localhost:4000/messages/send",
  {
    instanceId: "instance_uuid",
    to: "+254700016642",
    body: "Hello from NextMsg"
  },
  {
    headers: {
      Authorization: "Bearer nmsg_xxx"
    }
  }
).subscribe(console.log);`,
  python: `import requests

response = requests.post(
    "http://localhost:4000/messages/send",
    headers={"Authorization": "Bearer nmsg_xxx"},
    json={
        "instanceId": "instance_uuid",
        "to": "+254700016642",
        "body": "Hello from NextMsg",
    },
    timeout=15,
)

print(response.json())`,
  php: `<?php
$payload = json_encode([
  "instanceId" => "instance_uuid",
  "to" => "+254700016642",
  "body" => "Hello from NextMsg",
]);

$ch = curl_init("http://localhost:4000/messages/send");
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer nmsg_xxx",
    "Content-Type: application/json",
  ],
  CURLOPT_POSTFIELDS => $payload,
]);

echo curl_exec($ch);`,
  java: `HttpClient client = HttpClient.newHttpClient();
String json = """
{
  "instanceId": "instance_uuid",
  "to": "+254700016642",
  "body": "Hello from NextMsg"
}
""";

HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("http://localhost:4000/messages/send"))
  .header("Authorization", "Bearer nmsg_xxx")
  .header("Content-Type", "application/json")
  .POST(HttpRequest.BodyPublishers.ofString(json))
  .build();

System.out.println(client.send(request, HttpResponse.BodyHandlers.ofString()).body());`,
  dotnet: `using var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer nmsg_xxx");

var response = await client.PostAsJsonAsync(
  "http://localhost:4000/messages/send",
  new {
    instanceId = "instance_uuid",
    to = "+254700016642",
    body = "Hello from NextMsg"
  }
);

Console.WriteLine(await response.Content.ReadAsStringAsync());`,
  csharp: `using System.Net.Http.Headers;
using System.Text;

using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
  new AuthenticationHeaderValue("Bearer", "nmsg_xxx");

var json = """
{
  "instanceId": "instance_uuid",
  "to": "+254700016642",
  "body": "Hello from NextMsg"
}
""";

var response = await client.PostAsync(
  "http://localhost:4000/messages/send",
  new StringContent(json, Encoding.UTF8, "application/json")
);

Console.WriteLine(await response.Content.ReadAsStringAsync());`
  ,
  go: `package main

import (
  "bytes"
  "fmt"
  "net/http"
)

func main() {
  body := []byte(\`{"instanceId":"instance_uuid","to":"+254700016642","body":"Hello from NextMsg"}\`)
  req, _ := http.NewRequest("POST", "http://localhost:4000/messages/send", bytes.NewBuffer(body))
  req.Header.Set("Authorization", "Bearer nmsg_xxx")
  req.Header.Set("Content-Type", "application/json")
  res, _ := http.DefaultClient.Do(req)
  fmt.Println(res.Status)
}`,
  ruby: `require "net/http"
require "json"

uri = URI("http://localhost:4000/messages/send")
request = Net::HTTP::Post.new(uri)
request["Authorization"] = "Bearer nmsg_xxx"
request["Content-Type"] = "application/json"
request.body = {
  instanceId: "instance_uuid",
  to: "+254700016642",
  body: "Hello from NextMsg"
}.to_json

puts Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }.body`,
  vbnet: `Using client As New HttpClient()
  client.DefaultRequestHeaders.Add("Authorization", "Bearer nmsg_xxx")
  Dim json = "{""instanceId"":""instance_uuid"",""to"":""+254700016642"",""body"":""Hello from NextMsg""}"
  Dim content = New StringContent(json, Encoding.UTF8, "application/json")
  Dim response = Await client.PostAsync("http://localhost:4000/messages/send", content)
  Console.WriteLine(Await response.Content.ReadAsStringAsync())
End Using`,
  c: `CURL *curl = curl_easy_init();
curl_easy_setopt(curl, CURLOPT_URL, "http://localhost:4000/messages/send");
curl_easy_setopt(curl, CURLOPT_POST, 1L);
curl_easy_setopt(curl, CURLOPT_POSTFIELDS,
  "{\\"instanceId\\":\\"instance_uuid\\",\\"to\\":\\"+254700016642\\",\\"body\\":\\"Hello from NextMsg\\"}");
struct curl_slist *headers = NULL;
headers = curl_slist_append(headers, "Authorization: Bearer nmsg_xxx");
headers = curl_slist_append(headers, "Content-Type: application/json");
curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
curl_easy_perform(curl);`,
  clojure: `(require '[clj-http.client :as http])

(http/post "http://localhost:4000/messages/send"
  {:headers {"Authorization" "Bearer nmsg_xxx"}
   :content-type :json
   :form-params {:instanceId "instance_uuid"
                 :to "+254700016642"
                 :body "Hello from NextMsg"}})`,
  dart: `final response = await http.post(
  Uri.parse("http://localhost:4000/messages/send"),
  headers: {
    "Authorization": "Bearer nmsg_xxx",
    "Content-Type": "application/json",
  },
  body: jsonEncode({
    "instanceId": "instance_uuid",
    "to": "+254700016642",
    "body": "Hello from NextMsg",
  }),
);`,
  swift: `var request = URLRequest(url: URL(string: "http://localhost:4000/messages/send")!)
request.httpMethod = "POST"
request.setValue("Bearer nmsg_xxx", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = """
{"instanceId":"instance_uuid","to":"+254700016642","body":"Hello from NextMsg"}
""".data(using: .utf8)

URLSession.shared.dataTask(with: request) { data, _, _ in
  print(String(data: data!, encoding: .utf8)!)
}.resume()`,
  objectivec: `NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"http://localhost:4000/messages/send"]];
[request setHTTPMethod:@"POST"];
[request setValue:@"Bearer nmsg_xxx" forHTTPHeaderField:@"Authorization"];
[request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
[request setHTTPBody:[@"{\\"instanceId\\":\\"instance_uuid\\",\\"to\\":\\"+254700016642\\",\\"body\\":\\"Hello from NextMsg\\"}" dataUsingEncoding:NSUTF8StringEncoding]];
[[NSURLSession.sharedSession dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
  NSLog(@"%@", [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]);
}] resume];`,
  powershell: `$headers = @{
  Authorization = "Bearer nmsg_xxx"
}

$body = @{
  instanceId = "instance_uuid"
  to = "+254700016642"
  body = "Hello from NextMsg"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/messages/send" -Method Post -Headers $headers -ContentType "application/json" -Body $body`,
  shell: `TOKEN="nmsg_xxx"
INSTANCE_ID="instance_uuid"

curl -s http://localhost:4000/messages/send \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d "{\\"instanceId\\":\\"$INSTANCE_ID\\",\\"to\\":\\"+254700016642\\",\\"body\\":\\"Hello from NextMsg\\"}"`,
  android: `val client = OkHttpClient()
val body = """
{"instanceId":"instance_uuid","to":"+254700016642","body":"Hello from NextMsg"}
""".toRequestBody("application/json".toMediaType())

val request = Request.Builder()
  .url("http://localhost:4000/messages/send")
  .addHeader("Authorization", "Bearer nmsg_xxx")
  .post(body)
  .build()

client.newCall(request).execute().use { println(it.body?.string()) }`,
  ios: `let url = URL(string: "http://localhost:4000/messages/send")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.addValue("Bearer nmsg_xxx", forHTTPHeaderField: "Authorization")
request.addValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: [
  "instanceId": "instance_uuid",
  "to": "+254700016642",
  "body": "Hello from NextMsg"
])

URLSession.shared.dataTask(with: request).resume()`
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(session ? { authorization: `Bearer ${session}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

function showMessage(target, message, type = "error") {
  target.textContent = message;
  target.className = `notice ${type}`;
  target.hidden = false;
}

function clearMessage(target) {
  target.textContent = "";
  target.hidden = true;
}

function setAuthenticated(result) {
  session = result.token;
  currentUser = result.user;
  localStorage.setItem("nextmsg_session", session);
  localStorage.setItem("nextmsg_user", JSON.stringify(currentUser));
  renderAuthState();
}

function clearSession() {
  session = null;
  currentUser = null;
  localStorage.removeItem("nextmsg_session");
  localStorage.removeItem("nextmsg_user");
  renderAuthState();
}

function renderAuthState() {
  const isAuthed = Boolean(session);
  authView.hidden = isAuthed;
  dashboardView.hidden = !isAuthed;
  document.querySelector("#userEmail").textContent = currentUser?.email || "";
  if (isAuthed) refresh();
}

function initLandingInteractions() {
  const storedTheme = localStorage.getItem("nextmsg_theme");
  if (storedTheme === "midnight") document.body.classList.add("midnight");

  document.querySelector("#themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("midnight");
    localStorage.setItem("nextmsg_theme", document.body.classList.contains("midnight") ? "midnight" : "daylight");
  });

  document.querySelectorAll(".code-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".code-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector("#apiCode").textContent = codeExamples[tab.dataset.code] || codeExamples.curl;
    });
  });

  document.querySelector("#copyCodeButton")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    await navigator.clipboard.writeText(document.querySelector("#apiCode").textContent);
    button.textContent = "Copied";
    button.classList.add("copied");
    setTimeout(() => {
      button.textContent = "Copy";
      button.classList.remove("copied");
    }, 1400);
  });

  document.querySelectorAll("[data-billing]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-billing]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const annual = button.dataset.billing === "annual";
      document.querySelector("#starterPrice").textContent = annual ? "$390" : "$39";
      document.querySelector("#starterPeriod").textContent = annual ? "/year" : "/Month";
      document.querySelector("#growthPrice").textContent = annual ? "$790" : "$79";
      document.querySelector("#growthPeriod").textContent = annual ? "/year" : "/Month";
    });
  });

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      button.closest(".faq-item").classList.toggle("open");
    });
  });

  const volume = document.querySelector("#messageVolume");
  const volumeValue = document.querySelector("#volumeValue");
  const queueAdvice = document.querySelector("#queueAdvice");

  function updateCalculator() {
    const value = Number(volume.value);
    volumeValue.textContent = value;
    queueAdvice.textContent = value > 600
      ? "Use multiple instances, opt-in lists, and conservative per-instance rate limits."
      : value > 240
        ? "Use queue workers and keep sending paced across the hour."
        : "One connected instance with a queue is usually enough for this test volume.";
  }

  volume?.addEventListener("input", updateCalculator);
  if (volume) updateCalculator();
}

function row(html) {
  const div = document.createElement("div");
  div.className = "item";
  div.innerHTML = html;
  return div;
}

function emptyState(text) {
  return row(`<span class="muted">${text}</span>`);
}

function updateTestInstanceSelect(instances) {
  const select = document.querySelector("#testInstanceSelect");
  const chatbotSelect = document.querySelector("#chatbotInstanceSelect");
  const currentValue = select.value;
  const currentChatbotValue = chatbotSelect.value;
  const connected = instances.filter((instance) => instance.status === "CONNECTED");

  select.replaceChildren(
    new Option("Select connected instance", ""),
    ...connected.map((instance) => new Option(`${instance.name}${instance.phoneNumber ? ` (${instance.phoneNumber})` : ""}`, instance.id))
  );

  if (connected.some((instance) => instance.id === currentValue)) {
    select.value = currentValue;
  }

  select.disabled = connected.length === 0;

  chatbotSelect.replaceChildren(
    new Option("All instances", ""),
    ...instances.map((instance) => new Option(`${instance.name}${instance.phoneNumber ? ` (${instance.phoneNumber})` : ""}`, instance.id))
  );

  if (instances.some((instance) => instance.id === currentChatbotValue)) {
    chatbotSelect.value = currentChatbotValue;
  }
}

async function refresh() {
  if (!session) return;
  clearMessage(appMessage);

  try {
    const [instances, tokens, webhooks, messages] = await Promise.all([
      api("/instances"),
      api("/dashboard/tokens"),
      api("/dashboard/webhooks"),
      api("/dashboard/messages?limit=50")
    ]);

    const chatbotRules = await api("/dashboard/chatbot-rules").catch((error) => ({
      data: [],
      setupError: error.message
    }));

    updateTestInstanceSelect(instances.data);

    document.querySelector("#instances").replaceChildren(...(
      instances.data.length
        ? instances.data.map((x) => row(`
          <strong>${x.name}</strong>
          <div class="muted">${x.status} ${x.phoneNumber || ""}</div>
          <button onclick="connect('${x.id}')">Connect</button>
          <button onclick="showQr('${x.id}')">Show QR</button>
          <div id="qr-${x.id}"></div>`))
        : [emptyState("No instances yet.")]
    ));

    document.querySelector("#tokens").replaceChildren(...(
      tokens.data.length
        ? tokens.data.map((x) => row(`<strong>${x.name}</strong><div class="muted">last4: ${x.last4} ${x.revokedAt ? "revoked" : "active"}</div>`))
        : [emptyState("No API tokens yet.")]
    ));

    document.querySelector("#webhooks").replaceChildren(...(
      webhooks.data.length
        ? webhooks.data.map((x) => row(`<strong>${x.url}</strong><div class="muted">${x.enabled ? "enabled" : "disabled"} ${x.events.join(", ")}</div>`))
        : [emptyState("No webhook URLs yet.")]
    ));

    document.querySelector("#messages").replaceChildren(...(
      messages.data.length
        ? messages.data.map((x) => row(`<strong>${x.direction}</strong> ${x.status} <span class="muted">${x.to || x.from || ""}</span><br>${x.body || x.mediaUrl || ""}`))
        : [emptyState("No messages yet.")]
    ));

    const instanceNames = new Map(instances.data.map((instance) => [instance.id, instance.name]));
    document.querySelector("#chatbotRules").replaceChildren(...(
      chatbotRules.setupError
        ? [emptyState(`Chatbot setup needs database migration: ${chatbotRules.setupError}`)]
        : chatbotRules.data.length
        ? chatbotRules.data.map((rule) => row(`
          <div class="rule-row">
            <div>
              <strong>${rule.name}</strong>
              <div class="muted">${rule.enabled ? "enabled" : "disabled"} · ${rule.matchType.replace("_", " ").toLowerCase()} · priority ${rule.priority} · ${rule.instanceId ? instanceNames.get(rule.instanceId) || "instance" : "all instances"}</div>
              <div><span class="muted">Trigger:</span> ${rule.matchType === "DEFAULT" ? "fallback" : rule.trigger}</div>
              <div><span class="muted">Reply:</span> ${rule.response}</div>
            </div>
            <div class="rule-actions">
              <button onclick="toggleChatbotRule('${rule.id}', ${!rule.enabled})">${rule.enabled ? "Disable" : "Enable"}</button>
              <button class="secondary" onclick="deleteChatbotRule('${rule.id}')">Delete</button>
            </div>
          </div>`))
        : [emptyState("No chatbot rules yet.")]
    ));
  } catch (error) {
    if (error.message.includes("Invalid or expired")) clearSession();
    showMessage(appMessage, error.message);
  }
}

document.querySelector("#authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(authMessage);

  const data = Object.fromEntries(new FormData(event.target));
  const mode = event.submitter.value;

  try {
    const result = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(data) });
    setAuthenticated(result);
    event.target.reset();
  } catch (error) {
    const hint = error.message === "Email already registered"
      ? "Email already registered. Click Log in with that email and password, or use a different email to register."
      : error.message;
    showMessage(authMessage, hint);
  }
});

document.querySelector("#instanceForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/instances", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    event.target.reset();
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
});

document.querySelector("#tokenForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const result = await api("/dashboard/tokens", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    document.querySelector("#newToken").textContent = `Copy this token now:\n${result.token}`;
    event.target.reset();
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
});

document.querySelector("#webhookForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/dashboard/webhooks", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    event.target.reset();
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
});

document.querySelector("#testMessageForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(appMessage);

  const resultTarget = document.querySelector("#testMessageResult");
  resultTarget.textContent = "";

  try {
    const result = await api("/dashboard/test-message", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(event.target)))
    });
    resultTarget.textContent = `${result.status} message ${result.id}`;
    showMessage(appMessage, `Test message ${result.status.toLowerCase()}.`, "success");
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
});

document.querySelector("#chatbotRuleForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage(appMessage);

  const data = Object.fromEntries(new FormData(event.target));
  data.enabled = Boolean(data.enabled);
  data.priority = Number(data.priority || 100);

  try {
    await api("/dashboard/chatbot-rules", {
      method: "POST",
      body: JSON.stringify(data)
    });
    event.target.reset();
    event.target.elements.enabled.checked = true;
    event.target.elements.priority.value = 100;
    showMessage(appMessage, "Chatbot rule created.", "success");
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
});

document.querySelector("#logoutButton").addEventListener("click", clearSession);

async function toggleChatbotRule(id, enabled) {
  try {
    await api(`/dashboard/chatbot-rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled })
    });
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
}

async function deleteChatbotRule(id) {
  try {
    await api(`/dashboard/chatbot-rules/${id}`, { method: "DELETE" });
    refresh();
  } catch (error) {
    showMessage(appMessage, error.message);
  }
}

async function connect(id) {
  try {
    await api(`/instances/${id}/connect`, { method: "POST" });
    setTimeout(() => showQr(id), 2000);
  } catch (error) {
    showMessage(appMessage, error.message);
  }
}

async function showQr(id) {
  try {
    const result = await api(`/instances/${id}/qr`);
    const target = document.querySelector(`#qr-${id}`);
    target.innerHTML = result.qr ? `<img class="qr" src="${result.qr}" alt="WhatsApp QR code">` : `<span class="muted">${result.status}</span>`;
  } catch (error) {
    showMessage(appMessage, error.message);
  }
}

initLandingInteractions();
renderAuthState();
