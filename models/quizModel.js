const mongoose = require('mongoose');

// Define the Question schema
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true },
});

// Define the Quiz schema
const QuizSchema = new mongoose.Schema({
  grade: { type: Number, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  questions: { type: [QuestionSchema], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create the Quiz model
const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;
