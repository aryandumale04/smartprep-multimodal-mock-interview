const questionAnswerPrompt = (
  role,
  experience,
  topicsToFocus,
  numberOfQuestions
) => `
You are an AI system that generates interview questions and answers.

TASK:
- Role: ${role}
- Experience: ${experience}
- Focus Topics: ${topicsToFocus}
- Generate EXACTLY ${numberOfQuestions} interview questions.
- For each question, generate a clear, beginner-friendly answer.
- Include a small code example ONLY if absolutely necessary.

STRICT OUTPUT RULES (MANDATORY):
- Output ONLY a valid JSON array.
- Do NOT include markdown, backticks, comments, or explanations.
- Do NOT include any text before or after the JSON.
- Use ONLY double quotes for keys and string values.
- Ensure the JSON is fully parseable by JSON.parse().
- If the output is not valid JSON, FIX IT before responding.

REQUIRED FORMAT:
[
  {
    "question": "Question text here",
    "answer": "Answer text here"
  }
]

FINAL CHECK:
Before responding, validate that the response is valid JSON and matches the required format exactly.
`;

const conceptExplainPrompt = (question) => `
You are an AI system that explains technical interview concepts.

TASK:
- Explain the following interview question briefly in 4–6 simple, clear lines.
- Question: "${question}"
- Provide a short, clear title summarizing the concept.
- Include code examples ONLY if they add real clarity.

STRICT OUTPUT RULES (MANDATORY):
- Output ONLY a valid JSON object.
- Do NOT include markdown, backticks, comments, or extra text.
- Use ONLY double quotes for keys and string values.
- Ensure the JSON is fully parseable by JSON.parse().
- If the output is not valid JSON, FIX IT before responding.

REQUIRED FORMAT:
{
  "title": "Short clear title",
  "explanation": "Concise explanation text"
}

FINAL CHECK:
Before responding, validate that the response is valid JSON and matches the required format exactly.
`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt
};
