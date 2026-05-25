import os
import requests

api_url = os.getenv("HYPERMSG_URL", "http://localhost:4000")
token = os.environ["HYPERMSG_TOKEN"]
instance_id = os.environ["HYPERMSG_INSTANCE_ID"]

response = requests.post(
    f"{api_url}/messages/send",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "instanceId": instance_id,
        "to": "+15551234567",
        "body": "Hello from Python",
    },
    timeout=15,
)
response.raise_for_status()
print(response.json())
