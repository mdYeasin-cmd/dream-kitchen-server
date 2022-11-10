const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.send({ errorMessage: 'Unauthorised access' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.send({ errorMessage: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}

// Database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.0nieed1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const foodCollection = client.db('foodsInfoDB').collection('foods');
        const reviewCollection = client.db('foodsInfoDB').collection('reviews');

        // Create JWT
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        });

        // Create Operation
        app.post('/addNewFood', async (req, res) => {
            const foodItem = req.body;
            console.log(foodItem);
            const result = await foodCollection.insertOne(foodItem);
            res.send(result);
        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        // Read Operation
        app.get('/foods', async (req, res) => {
            const query = {}
            const allFoods = await foodCollection.find(query).toArray();
            const cursor = foodCollection.find(query);
            const firstThreeFoods = await cursor.limit(3).toArray();
            res.send({ firstThreeFoods, allFoods });
        })

        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const food = await foodCollection.findOne(query);
            res.send(food);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { serviceId: id };
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            const reviews = result.reverse();
            res.send(reviews);
        })

        app.get('/singleReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = await reviewCollection.findOne(query)
            res.send(review);

        })

        app.get('/myReviews', verifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if(decoded.email !== req.query.email){
                res.send({message: 'Unauthorised access'});
            }

            let query = {}

            if(req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        

        // Update Operation
        app.patch('/singleReview/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body.reviewText;
            console.log(id, body);
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    reviewText: body
                }
            }
            const result = await reviewCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Delete Operation
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
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