const express = require('express');
const { summarizeDocument, compareSummaries } = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:id/summarize', protect, summarizeDocument);
router.post('/compare', protect, compareSummaries);

module.exports = router;
