import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5001/api/events/${id}`)
      .then((res) => {
        const { name, date, location, description } = res.data;
        setName(name);
        setDate(date.substring(0, 10)); // format for input type="date"
        setLocation(location);
        setDescription(description);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5001/api/events/${id}`, {
      name,
      date,
      location,
      description
    })
      .then(() => {
        setMessage('Event updated successfully!');
        setTimeout(() => navigate('/'), 2000); // ✅ redirects to the event list page

      })
      .catch((err) => {
        console.error(err);
        setMessage('Error updating event');
      });
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Event</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <label className="block mb-2 font-semibold">Event Name</label>
        <input className="w-full mb-4 p-2 border" value={name} onChange={e => setName(e.target.value)} required />

        <label className="block mb-2 font-semibold">Date</label>
        <input className="w-full mb-4 p-2 border" type="date" value={date} onChange={e => setDate(e.target.value)} required />

        <label className="block mb-2 font-semibold">Location</label>
        <input className="w-full mb-4 p-2 border" value={location} onChange={e => setLocation(e.target.value)} />

        <label className="block mb-2 font-semibold">Description</label>
        <textarea className="w-full mb-4 p-2 border" value={description} onChange={e => setDescription(e.target.value)} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Event</button>
      </form>
    </div>
  );
};

export default EditEvent;
