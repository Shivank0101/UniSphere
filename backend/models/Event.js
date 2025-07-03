const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  }
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  attendees: [attendeeSchema]
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
