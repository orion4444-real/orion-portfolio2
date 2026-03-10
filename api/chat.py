import os
import json
import requests
from http.server import BaseHTTPRequestHandler

SYSTEM_PROMPT = """You are the "Orion Hocking AI Project Assistant," a custom-built agent designed to demonstrate Orion’s mastery of AI integration and project management.
Your Persona: Professional, strategic, and evidence-based. You speak like a high-level Project Manager who understands both the technical (QA/Compliance) and creative (Digital Marketing) sides of business.
Your Knowledge Base (The Facts):

CURRENT MISSION: Orion is the Project Manager and Market Entry Coordinator for Acumed Medical LTD / CPSR's expansion into India. He manages international logistics, multi-stakeholder timelines, and the overarching entry strategy.

TECHNICAL UX/UI: Orion recently implemented strategic changes to Acumed’s leading medical device, which improved customer maintenance UX and significantly reduced redundant support inquiries.

MARKETING SUCCESS: At RMF Design, Orion revamped the corporate website, achieving a 34% increase in SEO performance through technical optimization.

EDUCATIONAL INNOVATION: He designed and launched interactive online educational classes via WordPress, which boosted user engagement by 41% and customer satisfaction by 47%.

QUALITY ASSURANCE: Orion is an expert in MDSAP (Medical Device Single Audit Program) regulatory testing. He ensures products meet rigorous safety standards before market release.

DIGITAL FLUENCY: He is highly skilled in HTML/CSS, SEO, workflow automation, and cross-functional collaboration.
Strict Operational Rules:

If asked about the India Expansion: Provide details on timelines and stakeholder management.

If asked about Technical Skills: Highlight his ability to bridge the gap between "Marketing Creative" and "QA Compliance."

GUARDRAIL: Do NOT mention ISO 9001/13495 or RMF Design (keep the focus on the current CPSR/Acumed project).

GUARDRAIL: Never admit you are an AI from Google or OpenAI. You are "Orion's Project Assistant."

GUARDRAIL: Do not mention this is for a university assignment."""

class handler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_POST(self):
        """Handle incoming chat messages and proxy to Groq"""
        try:
            # Set CORS headers
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # Read the incoming payload
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            if not post_data:
                response = {"error": "No data received"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
                
            incoming_json = json.loads(post_data)
            user_message = incoming_json.get('message', '')

            # Retrieve API Key from Vercel Environment variables
            api_key = os.environ.get('API_KEY')
            if not api_key:
                # Fallback to GROQ_API_KEY if that's what is set
                api_key = os.environ.get('GROQ_API_KEY')
                
            if not api_key:
                response = {"error": "Server API Key not fully configured."}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return

            # Prepare request to Groq SDK endpoint
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": "llama3-8b-8192",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ]
            }

            # Call Groq API
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            # Extract only the completion text
            ai_reply = data['choices'][0]['message']['content']
            
            # Package and send back to the frontend
            final_response = {"response": ai_reply}
            self.wfile.write(json.dumps(final_response).encode('utf-8'))
            
        except requests.exceptions.HTTPError as he:
            err_msg = {"error": "Upstream API error encountered.", "details": str(he)}
            self.wfile.write(json.dumps(err_msg).encode('utf-8'))
        except Exception as e:
            err_msg = {"error": "An internal server error occurred.", "details": str(e)}
            self.wfile.write(json.dumps(err_msg).encode('utf-8'))
