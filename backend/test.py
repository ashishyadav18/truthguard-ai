import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Configure Gemini
try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    print("✅ Gemini API configured successfully")
    
    # List available models to verify connection
    print("\nAvailable models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f" - {m.name}")
    
    # Test a simple generation
    print("\nTesting model generation...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("What is 2+2?")
    
    print(f"\nResponse: {response.text}")
    print("✅ Gemini API is working correctly!")
    
except Exception as e:
    print(f"\n❌ Error testing Gemini API: {e}")
    print("Possible issues:")
    print("1. Invalid API key in .env file")
    print("2. Gemini API not enabled in Google Cloud Console")
    print("3. Network connectivity issues")
    print("4. Outdated google-generativeai package")