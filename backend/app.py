from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI  # Used for Ollama compatibility
import os
from dotenv import load_dotenv
from textblob import TextBlob

# Initialize
load_dotenv()
app = Flask(__name__)
CORS(app)

# Ollama Local AI Client
client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # Dummy key
)

# Fake News Detection
FAKE_NEWS_TRIGGERS = [
    "hoax", "fake", "conspiracy", "false flag",
    "deep state", "pizzagate", "qanon"
]

# Bias Analysis
BIAS_LEXICON = {
    # Left-leaning
    "woke": -2, "progressive": -1, "social justice": -2,
    "climate emergency": -1, "defund the police": -2,
    # Right-leaning
    "maga": 2, "conservative values": 1, "border security": 1,
    "fake news": 1, "traditional family": 1
}

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '')
        
        # Local AI Response
        response = client.chat.completions.create(
            model="llama3",
            messages=[{"role": "user", "content": user_input}],
            max_tokens=150
        )
        
        # Fake news check
        fake_alert = any(
            trigger in user_input.lower() 
            for trigger in FAKE_NEWS_TRIGGERS
        )
        
        return jsonify({
            "ai_response": response.choices[0].message.content,
            "fake_alert": fake_alert
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_bias', methods=['POST'])
def check_bias():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        bias_score = sum(
            BIAS_LEXICON.get(word.lower(), 0) 
            for word in text.split()
        )
        
        biased_phrases = [
            word for word in text.split() 
            if word.lower() in BIAS_LEXICON
        ]
        
        return jsonify({
            "bias_score": bias_score,
            "biased_phrases": biased_phrases,
            "level": "Left" if bias_score < 0 else "Right" if bias_score > 0 else "Neutral"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test')
def test():
    return jsonify({"status": "Backend is running!"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)