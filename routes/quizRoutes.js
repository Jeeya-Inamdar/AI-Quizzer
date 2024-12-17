const express = require('express');
const { generateQuiz, submitQuiz, getQuizHistory, retryQuiz,getHint } = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Quiz routes
router.post('/generate', verifyToken, generateQuiz);
router.post('/submit', verifyToken, submitQuiz);
router.get('/history', verifyToken, getQuizHistory);
router.post('/retry', verifyToken, retryQuiz);
router.post('/hint',verifyToken, getHint);

module.exports = router;
