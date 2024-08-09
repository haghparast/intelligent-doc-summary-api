const axios = require("axios");

const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
});

class OpenAIService {
  async summarizeText(text) {
    try {
      const response = await openai.post("/chat/completions", {
        model: "gpt-4",
        messages: [
          { role: "system", content: "Summarize the document." },
          { role: "user", content: text },
        ],
      });

      const summary = response.data.choices[0].message.content;
      return summary;
    } catch (error) {
      console.error(error.message);
      throw new Error("Failed to summarize text");
    }
  }

  async getEmbedding(text) {
    const response = await openai.post("/embeddings", {
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data.data[0].embedding;
  }
  
}

module.exports = OpenAIService;
