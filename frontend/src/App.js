import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [biasResult, setBiasResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Set dark mode on body
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await axios.post('http://localhost:5000/chat', {
        message: input
      });
      
      if (response.data.ai_response) {
        setMessages(prev => [...prev, {
          text: response.data.ai_response,
          isUser: false
        }]);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const checkBias = async () => {
    if (!messages.length) {
        alert("Please send a message first");
        return;
    }
    
    try {
        // Get the last user message
        const lastUserMsg = messages
            .filter(msg => msg.isUser)
            .slice(-1)[0]?.text;
        
        if (!lastUserMsg) {
            alert("No user message found");
            return;
        }

        console.log("Analyzing:", lastUserMsg);  // Debug log
        
        const response = await axios.post('http://localhost:5000/check_bias', {
            text: lastUserMsg
        });
        
        console.log("Analysis result:", response.data);  // Debug log
        
        if (response.data.success) {
            setBiasResult(response.data);
        } else {
            alert(response.data.message || "Analysis failed");
        }
    } catch (error) {
        console.error("Bias check error:", error.response?.data || error.message);
        alert(`Analysis failed: ${error.response?.data?.message || error.message}`);
    }
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>TruthGuard AI</h1>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="toggle-mode"
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isUser ? 'user' : 'ai'} ${msg.isError ? 'error' : ''}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="loading">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        <button 
          onClick={checkBias} 
          disabled={isLoading}
          className="bias-button"
        >
          Analyze Bias
        </button>
      </div>
      
      {biasResult && (
        <div className="bias-result">
          <h3>Bias Analysis Report</h3>
          {biasResult.error ? (
            <p className="error-message">{biasResult.error}</p>
          ) : (
            <>
              <div className="bias-metric">
                <span className="metric-label">Bias Score:</span>
                <span className={`metric-value ${
                  biasResult.bias_score > 3 ? 'strong-right' :
                  biasResult.bias_score > 0 ? 'moderate-right' :
                  biasResult.bias_score < -3 ? 'strong-left' :
                  biasResult.bias_score < 0 ? 'moderate-left' : 'neutral'
                }`}>
                  {biasResult.bias_score}
                </span>
              </div>
              <div className="bias-metric">
                <span className="metric-label">Bias Level:</span>
                <span className="metric-value">{biasResult.level}</span>
              </div>
              {biasResult.biased_phrases.length > 0 && (
                <div className="bias-metric">
                  <span className="metric-label">Trigger Phrases:</span>
                  <span className="metric-value phrases">
                    {biasResult.biased_phrases.join(', ')}
                  </span>
                </div>
              )}
              <div className="bias-metric">
                <span className="metric-label">Sentiment:</span>
                <span className="metric-value">
                  {biasResult.analysis.polarity > 0 ? 'Positive' : 
                   biasResult.analysis.polarity < 0 ? 'Negative' : 'Neutral'}
                  (Polarity: {biasResult.analysis.polarity.toFixed(2)}, 
                  Subjectivity: {biasResult.analysis.subjectivity.toFixed(2)})
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

