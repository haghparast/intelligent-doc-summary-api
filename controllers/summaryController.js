const Document = require("../models/documentModel");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const OpenAIService = require("../services/openaiService");

const extractTextFromDocx = (filePath) => {
  return new Promise((resolve, reject) => {
    mammoth
      .extractRawText({ path: filePath })
      .then((result) => {
        resolve(result.value);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const summarizeDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);
  const openAIService = new OpenAIService();

  if (!document || document.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.summary) {
    document.summary_embeddings = await openAIService.getEmbedding(
      document.summary
    );
    await document.save();
    return res.json({ summary: document.summary });
  }

  // Read the file content
  const filePath = path.join(__dirname, "..", document.filepath);
  let fileContent;

  if (document.filetype === "application/pdf") {
    // Read PDF file
    const data = fs.readFileSync(filePath);
    const pdfData = await pdf(data);
    fileContent = pdfData.text;
  } else if (
    document.filetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    fileContent = await extractTextFromDocx(filePath);
  } else if (document.filetype === "text/plain") {
    // Read TXT file
    fileContent = fs.readFileSync(filePath, "utf8");
  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  try {
    const summary = await openAIService.summarizeText(fileContent);
    document.summary = summary;
    document.summary_embeddings = await openAIService.getEmbedding(summary);
    await document.save();
    res.json({ summary });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const compareSummaries = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length < 2) {
      return res
        .status(400)
        .json({ error: "Provide at least two document ids to compare" });
    }
    const openAIService = new OpenAIService();

    const embeddings = [];
    for (const id of ids) {
      const document = await Document.findById(id);
      if (!document || document.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.summary && document.summary_embeddings.length > 0) {
        embeddings.push(document.summary_embeddings);
      } else {
        document.summary_embeddings = await openAIService.getEmbedding(
          document.summary
        );
        embeddings.push(document.summary_embeddings);
        await document.save();
      }
    }
    const similarity = cosineSimilarity(embeddings[0], embeddings[1])

    res.json({ similarity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error comparing summaries" });
  }

  function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

};

module.exports = { summarizeDocument, compareSummaries };
