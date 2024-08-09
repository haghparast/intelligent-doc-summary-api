# Intelligent Document Summarization API

## Overview

The Intelligent Document Summarization API allows users to upload documents in various formats (PDF, DOCX, or TXT), generate summaries using OpenAI's language models, and manage their documents and summaries. This API is built using Node.js, Express.js, and MongoDB.

## Features

- **User Authentication & Authorization**: Users can register, login, and manage their documents and summaries.
- **Document Upload**: Users can upload documents in PDF, DOCX, or TXT formats.
- **Document Management**: Users can retrieve a list of their uploaded documents.
- **Document Summarization**: Summarize the content of uploaded documents using OpenAI's API.
- **Error Handling**: Proper validation and error handling for all inputs and actions.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **OpenAI Integration**: Axios
- **Testing**: Jest, Supertest

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/haghparast/intelligent-doc-summary-api.git
    cd intelligent-doc-summary-api
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and configure the following environment variables:

    ```env
    PORT=6000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    OPENAI_API_KEY=your_openai_api_key
    ```

4. Start the server:

    ```bash
    npm start
    ```

5. The API will be running at `http://localhost:6000`.

## API Documentation

### Authentication

- **Register**: `POST /api/auth/register`
  - Request Body: `{ "username": "string", "email": "string", "password": "string" }`
  - Response: `{ "_id": "string", "username": "string", "email": "string", "token": "string" }`

- **Login**: `POST /api/auth/login`
  - Request Body: `{ "email": "string", "password": "string" }`
  - Response: `{ "_id": "string", "username": "string", "email": "string", "token": "string" }`

### Document Management

- **Upload Document**: `POST /api/documents/upload`
  - Headers: `Authorization: Bearer <token>`
  - Form Data: `document: <file>`
  - Response: `{ "_id": "string", "filename": "string", "filepath": "string", "filetype": "string", "filesize": "string", "createdAt": "string", "user": "string", "uploadDate": "string" }`

- **Download Document**: `GET /api/documents/:id/download`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Binary file`

- **Get Documents**: `GET /api/documents`
  - Headers: `Authorization: Bearer <token>`
  - Response: `[ { "_id": "string", "filename": "string", "filepath": "string", "filetype": "string", "filesize": "string", "createdAt": "string", "user": "string", "uploadDate": "string", "summary": "string", "summary_embeddings": [Number,...] }, ... ]`

- **Upload and Summarize Document**: `POST /api/documents/upload-and-summarize`
  - Headers: `Authorization: Bearer <token>`
  - Form Data: `documents: <file>`
  - Response: `["string",...]`

### Document Summarization

- **Summarize Document**: `POST /api/summaries/:id/summarize`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "summary": "string" }`

- **Compare Summaries**: `POST /api/summaries/compare`
  - Headers: `Authorization: Bearer <token>`
  - Request Body: `{ "ids": ["string", ...] }`
  - Response: `{ "similarity": Number }`

## Testing

To run the tests, use the following command:

```bash
npm test
```