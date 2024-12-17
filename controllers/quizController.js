const Quiz = require("../models/quizModel");
const Submission = require("../models/Submission");
const client = require("../utils/redisClient");

// Generate a new quiz
const { generateQuizWithGroq } = require("../utils/aiUtils");

const generateQuiz = async (req, res) => {
  const { grade, subject, totalQuestions, difficulty } = req.body;

  try {
    // Validate request body
    if (!grade || !subject || !totalQuestions || !difficulty) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: grade, subject, totalQuestions, difficulty",
      });
    }
    // Create a cache key
    const cacheKey = `quiz:${grade}:${subject}:${totalQuestions}:${difficulty}`;

    // Check if the quiz data exists in Redis
    const cachedQuiz = await client.get(cacheKey);
    const requestCountKey = `${cacheKey}:count`;

    if (cachedQuiz) {
      // Increment request count in Redis
      let requestCount = await client.get(requestCountKey);
      requestCount = requestCount ? parseInt(requestCount) + 1 : 1;

      if (requestCount < 2) {
        // Update the request count in Redis
        await client.set(requestCountKey, requestCount, { EX: 3600 }); // Reset after 1 hour
        console.log("Cache hit. Returning cached quiz.");

        return res
          .status(200)
          .json({ success: true, quizData: JSON.parse(cachedQuiz) });
      }
      console.log("Cache hit, but regenerating quiz due to request count.");
      await client.del(cacheKey); // Remove the cached quiz
      await client.del(requestCountKey); // Reset request count
    } else {
      console.log("Cache miss for quiz generation. Generating new quiz...");
    }

    // Generate quiz using Groq API
    const quizData = await generateQuizWithGroq({
      grade,
      subject,
      totalQuestions,
      difficulty,
    });
    const newQuiz = new Quiz({
      grade,
      subject,
      difficulty,
      totalQuestions,
      questions: quizData, // Assuming `quizData.questions` contains the questions
    });

    // Save the quiz to the database
    const savedQuiz = await newQuiz.save();

    // Cache the quiz for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(quizData));

    // Send the quiz as JSON response
    return res.status(200).json({ success: true, quizData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz answers

const { evaluateQuizWithAI } = require("../utils/aiUtils");

const submitQuiz = async (req, res) => {
  const { userId, quizId, answers } = req.body;

  // Validate the request
  if (!quizId || !answers || answers.length === 0) {
    return res
      .status(400)
      .json({ message: "Quiz ID and answers are required" });
  }

  try {
    // Find the quiz in the database by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const cacheKey = `submission:${quizId}:${userId}`;
    let cachedSubmission = await client.get(cacheKey);

    if (cachedSubmission) {
      console.log("Cache hit for quiz submission");
      return res.status(200).json(JSON.parse(cachedSubmission));
    }

    // Ensure the number of answers matches the number of questions in the quiz
    if (answers.length !== quiz.totalQuestions) {
      return res
        .status(400)
        .json({ message: "Answers do not match the number of questions" });
    }

    // Use AI to evaluate the answers
    const score = await evaluateQuizWithAI(quiz, answers);
    const newSubmission = new Submission({
      quizId,
      userId,
      score,
      answers,
    });

    // Save the submission to the database
    await newSubmission.save();

    // Send the score back to the user
    // Cache the submission for 1 hour
    const response = {
      message: "Quiz submitted and evaluated successfully",
      score,
    };
    await client.setEx(cacheKey, 3600, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: "Error evaluating the quiz" });
  }
};

// Get quiz history with filters
const getQuizHistory = async (req, res) => {
  const { userId } = req.query;
  const { grade, subject, minScore, maxScore, from, to } = req.query; // Extract filter params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const cacheKey = `history:${userId}`;
    let cachedHistory = await client.get(cacheKey);

    if (cachedHistory) {
      console.log("Cache hit for quiz history");
      return res.status(200).json(JSON.parse(cachedHistory));
    }

    // Build the filter object
    const filter = { userId };

    // Optional filters
    if (grade) {
      filter.grade = grade;
    }
    if (subject) {
      filter.subject = subject;
    }
    if (minScore || maxScore) {
      filter.score = {};
      if (minScore) filter.score.$gte = minScore;
      if (maxScore) filter.score.$lte = maxScore;
    }
    if (from && to) {
      filter.completedAt = {
        $gte: new Date(from), // Start date
        $lte: new Date(to), // End date
      };
    }

    // Retrieve quizzes based on the filter
    const quizzes = await Submission.find(filter).populate("quizId"); // You can populate other fields if needed

    // Cache the history for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(quizzes));

    res.status(200).json({ success: true, quizzes });
  } catch (error) {
    console.error("Error retrieving quiz history:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Retry quiz
const retryQuiz = async (req, res) => {
  const { quizId, userId, answers } = req.body;

  if (!quizId || !userId || !answers) {
    return res
      .status(400)
      .json({ message: "Quiz ID, User ID, and answers are required" });
  }

  try {
    // Retrieve the original quiz to generate new evaluation for the retry
    const originalQuiz = await Quiz.findById(quizId);
    if (!originalQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Recalculate the score using the provided answers and the original quiz's questions
    const score = await evaluateQuizWithAI(originalQuiz, answers); // Assuming the quiz has a `questions` field

    // Create a new submission for the quiz with the new answers and calculated score
    const newSubmission = new Submission({
      quizId: originalQuiz._id,
      userId,
      answers,
      score,
    });

    // Save the new submission
    const savedSubmission = await newSubmission.save();

    // Send the response with the new score
    res.status(200).json({
      success: true,
      message: "Quiz retried and submitted successfully",
      score: savedSubmission.score,
    });
  } catch (error) {
    console.error("Error retrying quiz:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const { generateHint } = require("../utils/aiUtils"); // Assuming you have an AI utility to generate hints

//! Function to get hints for a specific question
const getHint = async (req, res) => {
  const { question } = req.body; // The question for which the hint is needed

  if (!question) {
    return res.status(400).json({ message: "Question is required" });
  }

  try {
    const cacheKey = `hint:${question}`;
    let cachedHint = await client.get(cacheKey);

    if (cachedHint) {
      console.log("Cache hit for hint generation");
      return res
        .status(200)
        .json({ success: true, hint: JSON.parse(cachedHint) });
    }

    // Call AI function to generate a hint for the given question
    const hint = await generateHint(question);

    // Cache the hint for 1 hour
    await client.setEx(cacheKey, 3600, JSON.stringify(hint));

    // Return the hint in the response
    return res.status(200).json({
      success: true,
      hint,
    });
  } catch (error) {
    console.error("Error generating hint:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateQuiz,
  submitQuiz,
  getQuizHistory,
  retryQuiz,
  getHint,
};
