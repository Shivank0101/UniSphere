import Event from '../models/event.model.js';
import nodemailer from 'nodemailer';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createEvent = async (req, res) => {
  const { name, date,location,description } = req.body;
  const eventDate = new Date(date);
  const now = new Date();

  if (eventDate < now) {
    return res.status(400).json({ error: 'Event date must be in the future' });
  }

  try {
    const event = new Event({ name, date,location,description });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// edit event backend
export const updateEvent = async (req, res) => {
  try {
    const { name, date, location, description } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { name, date, location, description },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// the end

export const addAttendee = async (req, res) => {
  const { name, email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.attendees.push({ name, email });
    await event.save();
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendReminder = async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    const sendMailPromises = event.attendees.map(attendee => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: attendee.email,
        subject: `Reminder for ${event.name}`,
        text: `Hi ${attendee.name}, this is a reminder for the event: ${event.name}.`
      };
      return transporter.sendMail(mailOptions);
    });

    await Promise.all(sendMailPromises);
    res.status(200).json({ message: 'Reminders sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const searchEvents = async (req, res) => {
  const { name, date } = req.query;
  let filter = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }

  if (date) {
    filter.date = date;
  }

  try {
    const events = await Event.find(filter);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};