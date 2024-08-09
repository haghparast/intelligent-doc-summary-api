const express = require('express');
const { upload, uploadDocument, getDocuments, downloadDocument, uploadAndSummarizeDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/:id/download', protect, downloadDocument);
router.get('/', protect, getDocuments);
router.post('/upload-and-summarize', protect, upload.array('documents'), uploadAndSummarizeDocuments);

module.exports = router;
