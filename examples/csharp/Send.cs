using System.Net.Http.Headers;
using System.Text;

var apiUrl = Environment.GetEnvironmentVariable("NEXTMSG_URL") ?? "http://localhost:4000";
var token = Environment.GetEnvironmentVariable("NEXTMSG_TOKEN")!;
var instanceId = Environment.GetEnvironmentVariable("NEXTMSG_INSTANCE_ID")!;

using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

var json = $$"""
{
  "instanceId": "{{instanceId}}",
  "to": "+15551234567",
  "body": "Hello from C#"
}
""";

var response = await client.PostAsync(
    $"{apiUrl}/messages/send",
    new StringContent(json, Encoding.UTF8, "application/json")
);

response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());
