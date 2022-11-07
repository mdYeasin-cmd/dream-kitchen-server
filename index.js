const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Server testing API
app.get('/', (req, res) => {
    res.send('Dream Kitchen server is running');
})

app.listen(port, () => {
    console.log(`Dream Kitchen server is running on port ${port}`);
})