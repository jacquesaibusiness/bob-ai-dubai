# main.py - Deploy this on Railway
from fastapi import FastAPI
import httpx
import hmac, hashlib, base64, secrets, time
from urllib.parse import quote

app = FastAPI()

@app.post("/dubai-pulse")
async def proxy_request(data: dict):
   # OAuth 1.0 signature generation
   key, secret = "vHwctkV7WZ8FT3hdMArVwDa9dVckOajg", "sArqxNlAS6chfsAY"
   timestamp, nonce = str(int(time.time())), secrets.token_hex(16)
   params = {"oauth_consumer_key": key, "oauth_nonce": nonce, "oauth_signature_method": "HMAC-SHA1", "oauth_timestamp": timestamp, "oauth_version": "1.0", "limit": "10"}
   param_string = "&".join([f"{quote(k)}={quote(str(v))}" for k, v in sorted(params.items())])
   base_string = f"GET&{quote('https://dubaipulse.gov.ae/api/data/property-transactions')}&{quote(param_string)}"
   signature = base64.b64encode(hmac.new(f"{quote(secret)}&".encode(), base_string.encode(), hashlib.sha1).digest()).decode()
   auth_header = f"OAuth {', '.join([f'{quote(k)}=\"{quote(str(v))}\"' for k, v in [('oauth_consumer_key', key), ('oauth_nonce', nonce), ('oauth_signature', signature), ('oauth_signature_method', 'HMAC-SHA1'), ('oauth_timestamp', timestamp), ('oauth_version', '1.0')]])}"
   
   # Make authenticated request to Dubai Pulse
   async with httpx.AsyncClient() as client:
       response = await client.get("https://dubaipulse.gov.ae/api/data/property-transactions", params={"limit": "10"}, headers={"Authorization": auth_header})
       return {"query": data.get("query", ""), "data": response.json() if response.status_code == 200 else {"error": response.text}}