const dotenv = require('dotenv');
dotenv.config();
const Groq = require('groq-sdk');

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Function to generate a quiz
const generateQuizWithGroq = async ({ grade, subject, totalQuestions, difficulty }) => {
  try {
    // Construct the AI prompt
    const prompt = `
      Generate a quiz for grade ${grade} students in the subject of ${subject}.
  The quiz should contain ${totalQuestions} questions with a difficulty level of ${difficulty}.
  Each question must have:
  - A "question" field (string).
  - An "options" field (array of 4 strings).
  - An "answer" field (string indicating the correct option).

  Return ONLY valid JSON. Do not include any explanations or extra text. Example format:
  [
    {
      "question": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "answer": "4"
    },
    ...
  ]
    `;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: prompt },
      ],
      model: 'llama3-8b-8192', // Example model, adjust as necessary
    });

    // Parse the response content
    const content = chatCompletion.choices[0]?.message?.content || '';
    return JSON.parse(content); // Assuming Groq returns valid JSON
  } catch (error) {
    console.error('Error generating quiz with Groq API:', error.message);
    throw new Error('Failed to generate quiz');
  }
};

// utils/aiUtils.js

async function evaluateQuizWithAI(quiz, answers) {
  // Prepare the AI prompt based on the quiz and answers
  const questionAnswerPairs = quiz?.questions?.map((question, index) => {
    return {
      question: question.question,
      answer: answers[index], // assuming answers are passed in the same order
    };
  });

  const prompt1 = questionAnswerPairs?.map(
    (pair) => `Question: ${pair.question}\nYour Answer: ${pair.answer}\n`
  ).join("\n");

  try {
    // Send the prompt to Groq for evaluation
    const evaluationResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Evaluate the following quiz answers and provide the score out of ${quiz.totalQuestions}:\n${prompt1}
           only give a number which will be the score not anything else like if score is 5 the response should be only 5 not other single word`,
        },
      ],
      model: "llama3-8b-8192", // Adjust to your model
    });

    // Process the response from Groq (assuming it's a numerical score)
    const score = parseInt(evaluationResponse.choices[0]?.message?.content || '0', 10);
    return score;
  } catch (error) {
    console.error("Error during AI evaluation:", error);
    throw new Error("Failed to evaluate quiz answers.");
  }
}

// Function to generate hint using Groq API
const generateHint = async (question) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Give a hint for this question: ${question} just give small hint nothing else like here is and all this just a half line small hint`,
        },
      ],
      model: "llama3-8b-8192",  // Choose the model as per your need
    });

    // Extract the hint from the AI response
    const hint = response.choices[0]?.message?.content || "Sorry, no hint available.";
    
    return hint;
  } catch (error) {
    console.error('Error generating hint from AI:', error);
    throw new Error("Error generating hint");
  }
};



module.exports = { generateQuizWithGroq,evaluateQuizWithAI,generateHint };
