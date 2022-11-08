const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0nieed1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const foodCollection = client.db('foodsInfoDB').collection('foods');
        // Create Operation
        app.post('/addNewFood', async(req, res) => {
            const foodItem = req.body;
            console.log(foodItem);
            const result = await foodCollection.insertOne(foodItem);
            res.send(result);
        })
    }
    catch {

    }
}

run().catch(error => console.error(error));

// Server testing API
app.get('/', (req, res) => {
    res.send('Dream Kitchen server is running');
})

app.listen(port, () => {
    console.log(`Dream Kitchen server is running on port ${port}`);
})