import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [biasResult, setBiasResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await axios.post('http://localhost:5000/chat', {
        message: input
      });
      
      setMessages(prev => [...prev, {
        text: response.data.ai_response,
        isUser: false,
        fakeAlert: response.data.fake_alert
      }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
    
    setInput('');
  };

  // Add this missing function
  const checkBias = async () => {
    if (!messages.length) return;
    
    const lastUserMsg = messages
      .filter(msg => msg.isUser)
      .slice(-1)[0]?.text;
    
    if (!lastUserMsg) return;

    try {
      const response = await axios.post('http://localhost:5000/check_bias', {
        text: lastUserMsg
      });
      setBiasResult(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Add this function for fact checking
  const checkFakeNews = async () => {
    if (!messages.length) return;
    
    const lastUserMsg = messages
      .filter(msg => msg.isUser)
      .slice(-1)[0]?.text;
    
    if (!lastUserMsg) return;

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        message: lastUserMsg
      });
      alert(response.data.fake_alert ? 
        "⚠️ This message contains fake news triggers" : 
        "No fake news detected");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="app">
      <h1>TruthGuard AI</h1>
      
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
            <p>{msg.text}</p>
            {msg.fakeAlert && (
              <div className="fake-alert">
                ⚠️ Potential misinformation
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="loading">AI is thinking...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          Send
        </button>
        <button onClick={checkBias} disabled={isLoading}>
          Analyze Bias
        </button>
        <button onClick={checkFakeNews} disabled={isLoading}>
          Fact Check
        </button>
      </div>
      
      {biasResult && (
        <div className="bias-result">
          <h3>Bias Analysis</h3>
          <p><strong>Score:</strong> {biasResult.bias_score}</p>
          <p><strong>Level:</strong> {biasResult.level}</p>
          <p><strong>Trigger Phrases:</strong> {biasResult.biased_phrases.join(', ')}</p>
        </div>
      )}
    </div>
  );
}

export default App;