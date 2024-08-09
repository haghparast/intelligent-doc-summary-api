const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  filetype: { type: String, required: true },
  filesize: { type: String, required: true },
  summary: { type: String },
  summary_embeddings: { type: [Number] },
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Document", documentSchema);
