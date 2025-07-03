import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); // Save token
      navigate('/'); // Go to homepage
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input className="border p-2 w-full mb-3" placeholder="Email" type="email" onChange={(e) => setEmail(e.target.value)} required />
      <input className="border p-2 w-full mb-3" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} required />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Login</button>
    </form>
  );
};

export default Login;
