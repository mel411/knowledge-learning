const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

router.get('/cursus/:cursusId', lessonController.getLessonsByCursus);

module.exports = router;