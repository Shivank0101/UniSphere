import express from 'express';
const router = express.Router();
import {
  getEvents,
  createEvent,
  deleteEvent,
  addAttendee,
  sendReminder,
  searchEvents,
  getEventById,
  updateEvent  // added this line
} from '../controllers/event.controllers.js';

router.get('/', getEvents);
router.post('/', createEvent);
// new part below
router.put('/:id', updateEvent);

router.delete('/:id', deleteEvent);
router.post('/attendees/:eventId', addAttendee);
router.post('/reminder/:eventId', sendReminder);
router.get('/search', searchEvents);
router.get('/:id', getEventById);

export default router;