const express = require('express');
const router = express.Router();
const { getNotifications, addNotification } = require('../controllers/notificationController');

router.get('/', getNotifications);
router.post('/', addNotification);

module.exports = router;
