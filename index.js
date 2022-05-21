const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

// Mongodb Connection Uri----------------->
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ream4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//JWT------------------------>
function verifyJWT(req, res, next) {
    const hederAuth = req.headers.authorization
    if (!hederAuth) {
        return res.status(401).send({ message: 'unauthorized access.try again' })
    }
    else {
        const token = hederAuth.split(' ')[1]
        console.log({ token });
        jwt.verify(token, process.env.TOKEN, (err, decoded) => {

            if (err) {
                console.log(err);
                return res.status(403).send({ message: 'forbidden access' })
            }
            console.log('decoded', decoded);
            req.decoded = decoded;
            next()
        })
    }
    console.log(hederAuth, 'inside chckjwt');

}

//Connect DB------------------>
async function run() {
    try {
        await client.connect();
        console.log("db connected");
        const serviceCollection = client.db("assignment").collection("services");

        // Get All Data From serviceCollection------------->
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // Get a data by ID from serviceCollection------------->
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { "_id": ObjectId(id) }
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        // Post Data-------------->
        app.post('/services', async (req, res) => {
            const newData = req.body
            const result = await serviceCollection.insertOne(newData)

            res.send(result)
        })

        // Post Data and filter duplicate----------->
        // app.post('/user', async (req, res) => {
        //     const newData = req.body
        //     const query = { email: newData.email, password: newData.password }
        //     const exists = await dataCeCollection.findOne(query)

        //     if (exists) {
        //         return res.send({ success: false, user: 'alrady exists' })
        //     }
        //     const result = await serviceCollection.insertOne(ApData)

        //     res.send({ success: true, result })
        // })

        // Delete a Data------------------>
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const result = await serviceCollection.deleteOne({ "_id": ObjectId(id) });

            res.send(result)
        })

        // Put Data-------------------->
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    stock: updateProduct.newQuantity
                }
            }

            const result = await collection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        //JWT
        app.post('/register', async (req, res) => {
            const user = req.body;
            console.log(req.body, 'user')

            const getToken = jwt.sign(user, process.env.TOKEN, {
                expiresIn: '1d'
            });

            res.send({ getToken });
        })
        // get items by email 
        app.get('/service', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            console.log('decodedEmail', decodedEmail);
            const email = req.query.email;
            console.log("email", email);
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = collection.find(query)
                const items = await cursor.toArray()
                res.send(items)
            }
            else {
                // console.log(param);
                return res.status(403).send({ message: 'forbidden access' })

            }
        })
    }
    finally {
        // await client.close()
    }

}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(PORT, () => {
    console.log(`Listening from port ${PORT}`)
}) 