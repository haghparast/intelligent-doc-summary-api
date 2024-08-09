const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/summaries', require('./routes/summaryRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;