import { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AuthForm({ mode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = mode === 'login' 
      ? await login(username, password)
      : await register(username, password);
    
    if (!success) alert("Authentication failed");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">
        {mode === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
}

