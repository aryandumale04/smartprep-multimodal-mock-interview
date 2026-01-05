const axios = require("axios");
const {
  questionAnswerPrompt,
  conceptExplainPrompt
} = require("../utils/prompts");

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/*
   SAFETY / USAGE LIMITS
*/
const LIMITS = {
  MAX_QUESTIONS: 5,
  MAX_TOPICS: 5,
  ROLE_CHARS: 100,
  EXPERIENCE_CHARS: 100,
  TOPIC_CHARS: 50,
  MAX_PROMPT_CHARS: 4000
};

/*
   AI CALL HELPER WITH RETRY
   - 1 retry only
   - retries only on transient failures
*/
const callAIWithRetry = async (payload, headers) => {
  try {
    return await axios.post(OPENROUTER_URL, payload, { headers });
  } catch (error) {
    const status = error.response?.status;

    // Retry only for transient errors
    if (status >= 500 || status === 429) {
      return await axios.post(OPENROUTER_URL, payload, { headers });
    }

    throw error;
  }
};

//@desc Generate interview questions and answers
//@route POST /api/ai/generate-questions
//@access Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numbersOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numbersOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /*
       INPUT SANITIZATION
    */
    const safeRole = role.slice(0, LIMITS.ROLE_CHARS);
    const safeExperience = experience.slice(0, LIMITS.EXPERIENCE_CHARS);

    const safeTopics = Array.isArray(topicsToFocus)
      ? topicsToFocus
          .slice(0, LIMITS.MAX_TOPICS)
          .map(t => t.slice(0, LIMITS.TOPIC_CHARS))
      : [];

    const safeQuestionCount = Math.min(
      Number(numbersOfQuestions),
      LIMITS.MAX_QUESTIONS
    );

    let prompt = questionAnswerPrompt(
      safeRole,
      safeExperience,
      safeTopics,
      safeQuestionCount
    );

    if (prompt.length > LIMITS.MAX_PROMPT_CHARS) {
      prompt = prompt.slice(0, LIMITS.MAX_PROMPT_CHARS);
    }

    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    };

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await callAIWithRetry(payload, headers);

    const rawText = response.data.choices[0].message.content;

    const cleannedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const data = JSON.parse(cleannedText);
    return res.status(200).json(data);

  } catch (error) {
    console.error("AI ERROR FULL:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return res.status(500).json({
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
};

//@desc Generate explanation for an interview question
//@route POST /api/ai/generate-explanation
//@access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let prompt = conceptExplainPrompt(question);

    if (prompt.length > LIMITS.MAX_PROMPT_CHARS) {
      prompt = prompt.slice(0, LIMITS.MAX_PROMPT_CHARS);
    }

    const payload = {
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    };

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await callAIWithRetry(payload, headers);

    const rawText = response.data.choices[0].message.content;

    const cleannedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```$/, "")
      .trim();

    const data = JSON.parse(cleannedText);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      message: "AI service temporarily unavailable. Please try again."
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation
};
