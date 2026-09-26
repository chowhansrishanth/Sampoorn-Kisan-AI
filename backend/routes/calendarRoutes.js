'use strict';
const express = require('express');
const router = express.Router();
const { listCrops, getCropCalendar, getMonthTasks } = require('../controllers/calendarController');

router.get('/crops', listCrops);
router.get('/:crop', getCropCalendar);
router.get('/:crop/:month', getMonthTasks);

module.exports = router;
