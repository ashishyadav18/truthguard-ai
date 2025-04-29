import requests
response = requests.post(
    "http://localhost:5000/chat",
    json={"message": "Hello"},
    headers={"Content-Type": "application/json"}
)
print(response.json())

