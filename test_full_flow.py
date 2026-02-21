import requests
import time
import sys

BASE_URL = "http://localhost:8000/api"

def signup(email, password):
    r = requests.post(f"{BASE_URL}/auth/signup", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()
    # If 400, maybe user exists, try login
    return None

def login(email, password):
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if r.status_code == 200:
        return r.json()["access_token"]
    print(f"Login failed: {r.text}")
    return None

def get_me(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/users/me", headers=headers)
    return r.json()

def update_profile(token, name):
    headers = {"Authorization": f"Bearer {token}"}
    data = {"name": name, "age": 25, "bio": "Test bio"}
    requests.put(f"{BASE_URL}/users/me/profile", json=data, headers=headers)

def swipe(token, target_id, is_like=True):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE_URL}/swipes", json={"target_id": target_id, "is_like": is_like}, headers=headers)
    return r.json()

def get_matches(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/matches", headers=headers)
    return r.json()

def send_message(token, match_id, text):
    headers = {"Authorization": f"Bearer {token}"}
    requests.post(f"{BASE_URL}/matches/{match_id}/messages", json={"text": text}, headers=headers)

def main():
    # Wait for backend
    time.sleep(2)

    email1 = f"user1_{int(time.time())}@test.com"
    email2 = f"user2_{int(time.time())}@test.com"

    # 1. Signup/Login User 1
    signup(email1, "pass")
    token1 = login(email1, "pass")
    update_profile(token1, "User One")
    id1 = get_me(token1)["id"]
    print(f"User 1 ID: {id1}")

    # 2. Signup/Login User 2
    signup(email2, "pass")
    token2 = login(email2, "pass")
    update_profile(token2, "User Two")
    id2 = get_me(token2)["id"]
    print(f"User 2 ID: {id2}")

    # 3. User 1 swipes User 2
    res = swipe(token1, id2, True)
    print(f"User 1 swiped User 2: {res}")

    # 4. User 2 swipes User 1 (Should match)
    res = swipe(token2, id1, True)
    print(f"User 2 swiped User 1: {res}")

    if not res.get("is_match"):
        print("Error: Expected match!")

    # 5. Check matches
    matches1 = get_matches(token1)
    print(f"User 1 Matches: {len(matches1)}")
    if len(matches1) == 0:
        print("Error: User 1 has no matches")

    match_id = matches1[0]["id"]
    print(f"Match ID: {match_id}")

    # 6. Send Message
    send_message(token1, match_id, "Hello from User 1")

    # 7. Check matches for User 2 (should see message)
    matches2 = get_matches(token2)
    print(f"User 2 Matches: {len(matches2)}")
    last_msg = matches2[0].get("last_message")
    if last_msg and last_msg["text"] == "Hello from User 1":
        print("Message received correctly!")
    else:
        print(f"Error: Message not received. Last msg: {last_msg}")

if __name__ == "__main__":
    main()
