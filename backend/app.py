from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Initialize
load_dotenv()
app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Use the correct model name from your available models
model = genai.GenerativeModel('gemini-2.0-flash')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '')
        
        # Generate response with proper configuration
        response = model.generate_content(
            user_input,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=1000,
                temperature=0.7
            ),
            safety_settings={
                "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE",
                "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE"
            }
        )
        
        return jsonify({
            "ai_response": response.text
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            "ai_response": "Sorry, I encountered an error. Please try again.",
            "error": str(e)
        }), 200


# Bias Analysis
BIAS_LEXICON = {
    # Left-leaning terms (negative score)
    "woke": -2, "progressive": -1, "social justice": -2,
    "climate emergency": -1, "defund the police": -2,
    "lgbtq+": -1, "systemic racism": -1, "privilege": -1,
    
    # Right-leaning terms (positive score)
    "maga": 2, "conservative values": 1, "border security": 1,
    "traditional family": 1, "pro-life": 1, "second amendment": 1,
    "religious freedom": 1
}

@app.route('/check_bias', methods=['POST'])  # Make sure endpoint matches exactly
def check_bias():
    try:
        # Get the input text
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' in request"}), 400
        
        text = data['text'].lower()  # Convert to lowercase for case-insensitive matching
        
        # Initialize analysis
        bias_score = 0
        found_phrases = []
        
        # Calculate bias score
        for phrase, score in BIAS_LEXICON.items():
            if phrase.lower() in text:
                bias_score += score
                found_phrases.append(phrase)
        
        # Determine bias level
        if bias_score < -3:
            level = "Strong Left Bias"
        elif bias_score < 0:
            level = "Moderate Left Bias"
        elif bias_score > 3:
            level = "Strong Right Bias"
        elif bias_score > 0:
            level = "Moderate Right Bias"
        else:
            level = "Neutral"
        
        return jsonify({
            "success": True,
            "bias_score": bias_score,
            "biased_phrases": found_phrases,
            "level": level,
            "text_analyzed": text  # For debugging
        })
        
    except Exception as e:
        print(f"Bias analysis error: {str(e)}")  # Log the error
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Bias analysis failed"
        }), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)