import { Event } from '../models/event.model.js';
import { Club } from '../models/club.model.js';
import { User } from '../models/user.model.js';
import { Registration } from '../models/registration.model.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .populate('registrations')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .populate('registrations');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createEvent = async (req, res) => {
  const { title, description, startDate, endDate, location, club, maxCapacity, eventType, imageUrl, tags } = req.body;
  
  // Get organizer from authenticated user
  const organizer = req.user._id;
  
  const eventStartDate = new Date(startDate);
  const eventEndDate = new Date(endDate);
  const now = new Date();

  // Validation
  if (!title || !description || !startDate || !endDate || !location || !club) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  if (eventStartDate < now) {
    return res.status(400).json({ error: 'Event start date must be in the future' });
  }

  if (eventEndDate <= eventStartDate) {
    return res.status(400).json({ error: 'Event end date must be after start date' });
  }

  try {
    // Verify that the club exists and the user has permission to create events for it
    const clubDoc = await Club.findById(club);
    if (!clubDoc) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Check if user is the faculty coordinator of the club
    if (!clubDoc.facultyCoordinator.equals(organizer)) {
      return res.status(403).json({ error: 'Only the faculty coordinator can create events for this club' });
    }

    const event = new Event({ 
      title, 
      description, 
      startDate: eventStartDate, 
      endDate: eventEndDate, 
      location, 
      club, 
      organizer, // Now set from authenticated user
      maxCapacity, 
      eventType, 
      imageUrl, 
      tags 
    });
    await event.save();

    // Add event to club's events array
    await Club.findByIdAndUpdate(club, { $push: { events: event._id } });
    
    // Populate the created event before sending response
    const populatedEvent = await Event.findById(event._id)
      .populate('club', 'name description')
      .populate('organizer', 'name email department');
    
    res.status(201).json(populatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// edit event backend
export const updateEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, maxCapacity, eventType, imageUrl, tags } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (location) updateData.location = location;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
    if (eventType) updateData.eventType = eventType;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (tags) updateData.tags = tags;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('club', 'name category')
     .populate('organizer', 'name email');

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchEvents = async (req, res) => {
  const { title, location, eventType, startDate, endDate, tags } = req.query;
  let filter = { isActive: true };

  if (title) {
    filter.title = { $regex: title, $options: 'i' };
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (eventType) {
    filter.eventType = eventType;
  }

  if (startDate) {
    filter.startDate = { $gte: new Date(startDate) };
  }

  if (endDate) {
    filter.endDate = { $lte: new Date(endDate) };
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filter.tags = { $in: tagArray };
  }

  try {
    const events = await Event.find(filter)
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });
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

// Get events by club
export const getEventsByClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const events = await Event.find({ club: clubId, isActive: true })
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .populate('registrations', 'name email')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get events by organizer
export const getEventsByOrganizer = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const events = await Event.find({ organizer: organizerId })
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .populate('registrations', 'name email')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find({ 
      startDate: { $gt: now }, 
      isActive: true 
    })
      .populate('club', 'name category')
      .populate('organizer', 'name email')
      .sort({ startDate: 1 })
      .limit(10);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Deactivate event (soft delete)
export const deactivateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).populate('club', 'name category')
     .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ 
      message: 'Event deactivated successfully',
      event 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};