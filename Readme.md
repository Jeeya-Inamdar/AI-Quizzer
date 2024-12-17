# 📚 AI Quizzer

A robust and scalable Quiz API built with Node.js, Express.js, and MongoDB that allows users to generate quizzes, submit answers, track history, and retry quizzes with AI-based evaluation and hints functionality.

## 📝 Structure

```bash
      quiz-api/
      ├── controllers/
      │   ├── authController.js
      │   └── quizController.js
      ├── middlewares/
      │   ├── authMiddleware.js
      │   ├── cacheMiddleware.js
      │   └── errorHandler.js
      ├── models/
      │   ├── Quiz.js
      │   ├── User.js
      │   └── Submission.js
      ├── routes/
      │   ├── authRoutes.js
      │   └── quizRoutes.js
      ├── utils/
      │   ├── aiUtil.js
      │   ├── jwtUtil.js
      │   └── redisClient.js
      ├── .env
      ├── .gitignore
      ├── Dockerfile
      ├── docker-compose.yml
      ├── app.js
      ├── package.json
      └── README.md
```

## 🌟 Features

- **User Authentication**: Secure user signup and login using JWT.
- **Quiz Generation**: AI-driven dynamic quiz generation based on grade, subject, and difficulty.
- **Submission and Evaluation**: Submit quiz answers and get AI-evaluated scores.
- **Retry Functionality**: Retake quizzes while preserving previous attempts.
- **Quiz History**: Filterable quiz history based on grade, subject, date range, and more.
- **AI Hints**: Request hints for specific questions using AI.

## 🖼️ Photos

### Endpoints Testing

![Endpoint testing 1](../QuizAPI/pics/1.jpeg)

![Endpoint testing 2](../QuizAPI/pics/3.jpeg)

### Redis Caching

![Redis caching](../QuizAPI/pics/2.jpeg)

## 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+)
- MongoDB
- Postman (optional, for testing APIs)

### Installation

1. Download project:

   ```bash
   cd AI_Quizzer

   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Set up environment variables:

- Create a `.env` file in the root directory.
- Add the following:

  ```env
  # Server Configuration
   PORT=3000

  # MongoDB Configuration
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority&appName=<app-name>

   # JWT Secret for Authentication
   JWT_SECRET=<your-jwt-secret>

   # Email Service Configuration
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-email-password>

   # API Keys
   GROQ_API_KEY=<your-groq-api-key>

   # Redis Configuration
   REDIS_HOST=<redis-host>
   REDIS_PORT=<redis-port>
  ```

### Start the server:

    npm start

## 🛠️ API Endpoints

### Authentication

- **Signup**: `POST /auth/signup`
  ```json
  {
    "username": "user123",
    "password": "securepassword"
  }
  ```
- **Login**: `POST /auth/login`
  ```json
  {
    "username": "user123",
    "password": "securepassword"
  }
  ```

### Quiz Operations

- **Generate Quiz**: `POST /quiz/generate`

  ```json
  {
    "grade": 10,
    "subject": "Math",
    "totalQuestions": 5,
    "difficulty": "medium"
  }
  ```

- **Submit Quiz**: `POST /quiz/submit`

  ```json
  {
    "quizId": "quiz_id",
    "userId": "user_id",
    "answers": [1, 2, 0, 3]
  }
  ```

- **Retry Quiz**: `POST /quiz/retry`

  ```json
  {
    "quizId": "quiz_id",
    "userId": "user_id",
    "answers": [1, 2, 0, 3]
  }
  ```

- **Get Quiz History**: `GET /quiz/history?userId=user_id&grade=10&subject=Math&from=2024-01-01&to=2024-12-31`

- **Get Hints**: `POST /quiz/hints`
  ```json
  {
    "question": "What is the capital of France?"
  }
  ```
- #### Start Redis Stack

  Run the following command to set up Redis Stack using Docker:

  ```bash
  docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
  ```

## ⚙️ Technologies Used

- **Backend**: Node.js, Express.js
- **Tools**: Docker, Redis, Postman
- **Database**: MongoDB
- **Authentication**: JWT
- **AI Integration**: Custom AI API for quiz generation and hints

## 👨‍💻 Contributors

- **Name**: Jeeya Inamdar

## 📝 Acknowledgements

- **GroqAI**: For AI-powered quiz generation and hints.
- **Redis**: For Data caching of endpoints.
