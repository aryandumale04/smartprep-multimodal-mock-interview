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
  EXPERIENCE_CHARS: 50,
  TOPIC_CHARS: 50,
  DESCRIPTION_CHARS: 300,
  MAX_PROMPT_CHARS: 4000
};

/*
   AI CALL HELPER WITH RETRY
*/
const callAIWithRetry = async (payload, headers) => {
  try {
    return await axios.post(OPENROUTER_URL, payload, { headers });
  } catch (error) {
    const status = error.response?.status;
    if (status >= 500 || status === 429) {
      return await axios.post(OPENROUTER_URL, payload, { headers });
    }
    throw error;
  }
};

//@route POST /api/ai/generate-questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const {
      role,
      experience,
      topicsToFocus,
      description,
      numbersOfQuestions
    } = req.body;

    if (!role || !experience || !topicsToFocus || !numbersOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const safeRole = role.slice(0, LIMITS.ROLE_CHARS);
    const safeExperience = experience.toString().slice(0, LIMITS.EXPERIENCE_CHARS);

    const safeTopics = Array.isArray(topicsToFocus)
  ? topicsToFocus
      .filter(t => typeof t === "string" && t.trim().length > 0)
      .slice(0, LIMITS.MAX_TOPICS)
      .map(t => t.slice(0, LIMITS.TOPIC_CHARS))
  : [];


    const safeDescription = description
      ? description.slice(0, LIMITS.DESCRIPTION_CHARS)
      : "";

    const safeQuestionCount = Math.min(
      Number(numbersOfQuestions),
      LIMITS.MAX_QUESTIONS
    );

    let prompt = questionAnswerPrompt(
      safeRole,
      safeExperience,
      safeTopics,
      safeDescription,
      safeQuestionCount
    );

    if (prompt.length > LIMITS.MAX_PROMPT_CHARS) {
      prompt = prompt.slice(0, LIMITS.MAX_PROMPT_CHARS);
    }

    const payload = {
      model: "openai/gpt-3.5-turbo",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }]
    };

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await callAIWithRetry(payload, headers);
    

    const rawText = response.data.choices[0].message.content;
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const data = JSON.parse(cleanedText);
    return res.status(200).json(data);

  } catch (error) {
    console.error("AI ERROR:", error.message);
    return res.status(500).json({
      message: "AI service temporarily unavailable."
    });
  }
};

//@route POST /api/ai/generate-explanation
//@route POST /api/ai/generate-explanation
//@route POST /api/ai/generate-explanation
const generateConceptExplanation = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (
      typeof question !== "string" ||
      typeof answer !== "string" ||
      !question.trim() ||
      !answer.trim()
    ) {
      return res.status(400).json({ message: "Invalid question or answer" });
    }

    const safeQuestion = question.slice(0, 1000);
    const safeAnswer = answer.slice(0, 3000);

    const prompt = conceptExplainPrompt(safeQuestion, safeAnswer);

    const payload = {
      model: "openai/gpt-3.5-turbo",
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }]
    };

    const headers = {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await callAIWithRetry(payload, headers);

    let raw = response.data.choices[0].message.content || "";

    // Remove markdown fences if present
    raw = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("EXPLANATION AI JSON PARSE FAILED:", err.message);

      // ✅ SAFE FALLBACK — NEVER CRASH
      return res.status(200).json({
        title: "Concept Explanation",
        explanation: raw
      });
    }

    // Ensure explanation is always a string
    if (typeof parsed.explanation !== "string") {
      parsed.explanation = JSON.stringify(parsed.explanation, null, 2);
    }

    if (!parsed.title) {
      parsed.title = "Concept Explanation";
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("EXPLANATION AI ERROR:", error.message);
    return res.status(500).json({
      message: "AI service temporarily unavailable."
    });
  }
};





module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation
};
