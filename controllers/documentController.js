const Document = require("../models/documentModel");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1616161616161.pdf
  },
});

const openAIService = new OpenAIService();

const upload = multer({ storage: storage });

// Set up multer for file uploads
// const upload = multer({ dest: 'uploads/' });

const uploadDocument = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileType = file.mimetype;

  if (
    fileType !== "application/pdf" &&
    fileType !==
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
    fileType !== "text/plain"
  ) {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  try {
    const document = new Document({
      filename: req.file.filename,
      filepath: req.file.path,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      user: req.user._id,
    });

    await document.save();
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ error: "File upload failed" });
  }
};

const uploadAndSummarizeDocuments = async (req, res) => {
  try {
    const files = req.files;
    const summaries = [];

    let myDocuments = [];
    const errors = [];
    for (const file of files) {
      const filePath = path.join(__dirname, "..", file.path);

      let fileContent;
      const fileType = file.mimetype;
      
      if (
        fileType !== "application/pdf" &&
        fileType !==
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
        fileType !== "text/plain"
      ) {
        errors.push({ file, error: "Unsupported file type" });
        continue;
      }

      try {
        const document = new Document({
          filename: file.filename,
          filepath: file.path,
          filetype: file.mimetype,
          filesize: file.size,
          user: req.user._id,
        });

        if (fileType === 'application/pdf') {
          const data = fs.readFileSync(filePath);
          const pdfData = await pdf(data);
          fileContent = pdfData.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          fileContent = await extractTextFromDocx(filePath);
        } else if (fileType === 'text/plain') {
          fileContent = fs.readFileSync(filePath, 'utf8');
        }
  
        try {
          const summary = await openAIService.summarizeText(fileContent);
          document.summary = summary;
          summaries.push(summary);
        } catch (error) {
          console.log(error.message);
        }
  
        await document.save();
      } catch (err) {
        console.log(err.message)
      }

    }
    if (errors.length > 0) {
      res.status(207).json({ summaries, errors });
    } else {
      res.status(201).json(summaries);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error summarizing documents" });
  }
};

const getDocuments = async (req, res) => {
  const documents = await Document.find({ user: req.user._id });
  res.json(documents);
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }
    res.download(document.filepath, document.filename);
  } catch (err) {
    res.status(500).json({ error: "Error downloading file" });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getDocuments,
  downloadDocument,
  uploadAndSummarizeDocuments,
};
