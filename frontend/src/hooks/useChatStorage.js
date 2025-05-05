import { useEffect, useState } from 'react';
import axios from 'axios';

export function useChatStorage() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const saveChat = async (messages) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Save to server
      await axios.post('http://localhost:5000/auth/save-chat', {
        messages,
        title: messages[0]?.text?.substring(0, 30) || 'New Chat'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      // Save to session storage
      sessionStorage.setItem('current_chat', JSON.stringify(messages));
    }
  };

  const loadChats = async () => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      const { data } = await axios.get('http://localhost:5000/auth/get-chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(data);
    } else {
      const chat = sessionStorage.getItem('current_chat');
      if (chat) {
        setChats({ 'guest': JSON.parse(chat) });
      }
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return { chats, saveChat, currentChatId, setCurrentChatId };
}

