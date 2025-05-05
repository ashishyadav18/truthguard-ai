import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user, login, register, logout } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [biasResult, setBiasResult] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

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

      setMessages(prev => [...prev, {
        text: response.data.ai_response,
        isUser: false
      }]);
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
    try {
      const lastUserMsg = messages
        .filter(msg => msg.isUser)
        .slice(-1)[0]?.text;
      
      if (!lastUserMsg) {
        alert("No message to analyze");
        return;
      }

      const response = await axios.post('http://localhost:5000/check_bias', {
        text: lastUserMsg
      });

      setBiasResult({
        ...response.data,
        biased_phrases: response.data.biased_phrases || []
      });
    } catch (error) {
      console.error("Bias check failed:", error);
      setBiasResult({
        error: error.response?.data?.message || error.message
      });
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setBiasResult(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handleAuthSubmit = async (username, password) => {
    if (authMode === 'login') {
      await login(username, password);
    } else {
      await register(username, password);
    }
    setShowAuthModal(false);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span>+</span> New chat
        </button>
        
        <div className="history-container">
          {/* Chat history would go here */}
        </div>
        
        <div className="sidebar-footer">
          {user ? (
            <div className="user-section">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span>{user.username}</span>
              <button onClick={logout} className="logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="auth-options">
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                Login
              </button>
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                Register
              </button>
            </div>
          )}
          <button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.4 17.4l.7.7M5.6 18.4l.7-.7M17.4 6.6l.7-.7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Light mode
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Dark mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-content">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <h1>TruthGuard</h1>
            <p>Analyze bias in your conversations</p>
          </div>
        ) : (
          <div className="chat-container">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="loading-message">
                <div className="typing-indicator">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="input-container">
          <div className="input-box">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message TruthGuard..."
              disabled={isLoading}
            />
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          <button 
            className="bias-btn"
            onClick={checkBias}
            disabled={isLoading || messages.length === 0}
          >
            Analyze Bias
          </button>
        </div>

        {biasResult && (
          <div className="bias-report">
            <h3>Bias Analysis</h3>
            <div className="bias-metrics">
              <div className="metric">
                <span>Score:</span>
                <span className={`value ${getBiasScoreClass(biasResult.bias_score)}`}>
                  {biasResult.bias_score}
                </span>
              </div>
              <div className="metric">
                <span>Level:</span>
                <span>{biasResult.level}</span>
              </div>
              {biasResult.biased_phrases?.length > 0 && (
                <div className="metric">
                  <span>Trigger Phrases:</span>
                  <span className="phrases">
                    {biasResult.biased_phrases.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal">
          <div className="modal-content">
            <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAuthSubmit(formData.get('username'), formData.get('password'));
            }}>
              <input type="text" name="username" placeholder="Username" required />
              <input type="password" name="password" placeholder="Password" required />
              <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
            </form>
            <button 
              className="switch-mode"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
            </button>
            <button className="close-modal" onClick={() => setShowAuthModal(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getBiasScoreClass(score) {
  if (score > 3) return 'strong-right';
  if (score > 0) return 'moderate-right';
  if (score < -3) return 'strong-left';
  if (score < 0) return 'moderate-left';
  return 'neutral';
}

export default App;