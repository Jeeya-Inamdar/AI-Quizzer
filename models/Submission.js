const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  answers: { type: Array, required: true },
  completedAt: { type: Date, default: Date.now },
});

const Submission =  mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
