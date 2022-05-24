// const express = require('express');
// const cors = require('cors')
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken');
// require('dotenv').config()
// const PORT = process.env.PORT || 5000

// const app = express()
// app.use(cors())
// app.use(express.json())

// // Mongodb Connection Uri----------------->
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ream4.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// //JWT------------------------>
// function verifyJWT(req, res, next) {
//     const hederAuth = req.headers.authorization
//     if (!hederAuth) {
//         return res.status(401).send({ message: 'unauthorized access.try again' })
//     }
//     else {
//         const token = hederAuth.split(' ')[1]
//         console.log({ token });
//         jwt.verify(token, process.env.TOKEN, (err, decoded) => {

//             if (err) {
//                 console.log(err);
//                 return res.status(403).send({ message: 'forbidden access' })
//             }
//             console.log('decoded', decoded);
//             req.decoded = decoded;
//             next()
//         })
//     }
//     console.log(hederAuth, 'inside chckjwt');

// }

// //Connect DB------------------>
// async function run() {
//     try {
//         await client.connect();
//         console.log("db connected");
//         const serviceCollection = client.db("assignment").collection("services");

//         // Get All Data From serviceCollection------------->
//         app.get('/services', async (req, res) => {
//             const query = {};
//             const cursor = serviceCollection.find(query)
//             const result = await cursor.toArray()
//             res.send(result)
//         })

//         // Get a data by ID from serviceCollection------------->
//         app.get('/services/:id', async (req, res) => {
//             const id = req.params.id
//             const query = { "_id": ObjectId(id) }
//             const result = await serviceCollection.findOne(query)
//             res.send(result)
//         })

//         // Post Data-------------->
//         app.post('/services', async (req, res) => {
//             const newData = req.body
//             const result = await serviceCollection.insertOne(newData)

//             res.send(result)
//         })

//         // Post Data and filter duplicate----------->
//         // app.post('/user', async (req, res) => {
//         //     const newData = req.body
//         //     const query = { email: newData.email, password: newData.password }
//         //     const exists = await dataCeCollection.findOne(query)

//         //     if (exists) {
//         //         return res.send({ success: false, user: 'alrady exists' })
//         //     }
//         //     const result = await serviceCollection.insertOne(ApData)

//         //     res.send({ success: true, result })
//         // })

//         // Delete a Data------------------>
//         app.delete('/services/:id', async (req, res) => {
//             const id = req.params.id
//             const result = await serviceCollection.deleteOne({ "_id": ObjectId(id) });

//             res.send(result)
//         })

//         // Put Data-------------------->
//         app.put('/services/:id', async (req, res) => {
//             const id = req.params.id
//             const updateProduct = req.body
//             const query = { _id: ObjectId(id) }
//             const options = { upsert: true };
//             const updateDoc = {
//                 $set: {
//                     stock: updateProduct.newQuantity
//                 }
//             }

//             const result = await collection.updateOne(query, updateDoc, options)
//             res.send(result)
//         })

//         //JWT
//         app.post('/register', async (req, res) => {
//             const user = req.body;
//             console.log(req.body, 'user')

//             const getToken = jwt.sign(user, process.env.TOKEN, {
//                 expiresIn: '1d'
//             });

//             res.send({ getToken });
//         })
//         // get items by email
//         app.get('/service', verifyJWT, async (req, res) => {
//             const decodedEmail = req.decoded.email
//             console.log('decodedEmail', decodedEmail);
//             const email = req.query.email;
//             console.log("email", email);
//             if (email === decodedEmail) {
//                 const query = { email: email }
//                 const cursor = collection.find(query)
//                 const items = await cursor.toArray()
//                 res.send(items)
//             }
//             else {
//                 // console.log(param);
//                 return res.status(403).send({ message: 'forbidden access' })

//             }
//         })
//     }
//     finally {
//         // await client.close()
//     }

// }

// run().catch(console.dir)

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

// app.listen(PORT, () => {
//     console.log(`Listening from port ${PORT}`)
// })




const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }
        console.log("decoded", decoded);
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ream4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
const run = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("assignment");
        const toolsCollection = db.collection("toolsCollection");
        const ordersCollection = db.collection("ordersCollection");
        const userCollection = db.collection("userCollection");
        const reviewsCollection = db.collection("reviewsCollection");
        const adminCollection = db.collection("adminCollection");

        //Verify Admin Role 
        const verifyAdmin = async (req, res, next) => {
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({
                email: requester,
            });
            if (requesterAccount.role === "admin") {
                next();
            } else {
                res.status(403).send({ message: "Forbidden" });
            }
        };

        //create user
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {

                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const getToken = jwt.sign({ email: email }, process.env.TOKEN, { expiresIn: '1d' })
            res.send({ result, getToken })
        })

        //API to make Admin 
        app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: "admin" },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        //API to get admin 
        app.get("/admin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user?.role === "admin";
            res.send({ admin: isAdmin });
        });


        //Authentication API 
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d",
            });
            res.send({ accessToken });
        });

        // API to Run Server 
        app.get("/", async (req, res) => {
            res.send("Server is Running");
        });

        //API to get all tools 
        app.get("/tools", async (req, res) => {
            const tools = await toolsCollection.find({}).toArray();
            res.send(tools);
        });

        //API to get tools by id
        app.get("/tools/:id", async (req, res) => {
            const id = req.params.id;
            const tool = await toolsCollection.findOne({ _id: ObjectId(id) });
            res.send(tool);
        });

        ////API to get all orders
        app.get("/orders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        //API to post order
        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })

        //API to update a order 
        app.put("/orders/:id", async (req, res) => {
            const orderId = req.params.id;
            const order = req.body;
            const query = { _id: ObjectId(orderId) };
            const options = { upsert: true };
            const updatedOrder = await ordersCollection.findOneAndUpdate(
                query,
                {
                    $set: order,
                },
                options
            );
            res.send(updatedOrder);
        });

        //API to delete a order ADMIN
        app.delete("/order/:id", verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const id = req.params.id;
            const email = req.headers.email;
            if (decodedEmail) {

                const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
                res.send(result);
            } else {
                res.send("Unauthorized access");
            }
        });

        //API to delete order USER
        app.delete("/myorder/:id", checkJwt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const id = req.params.id;
            const email = req.headers.email;
            if (decodedEmail) {

                const result = await ordersCollection.deleteOne({ _id: ObjectId(id) });
                res.send(result);
            } else {
                res.send("Unauthorized access");
            }
        });

        //API to get order by email
        app.get('/orders', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email
            console.log("email", email, decodedEmail);
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = ordersCollection.find(query)
                const items = await cursor.toArray()
                res.send(items)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }
        })

        //API to get orders by user email
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            console.log('decodedEmail', decodedEmail);
            const email = req.query.email;
            console.log("email", email);
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = ordersCollection.find(query)
                const items = await cursor.toArray()
                res.send(items)
            }
            else {
                // console.log(param);
                return res.status(403).send({ message: 'forbidden access' })

            }
        })

        //API to manage order
        app.get("/orders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        //API to get all reviews 
        app.get("/reviews", async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray();
            res.send(reviews);
        });

        //API to post a review 
        app.post("/review", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const review = req.body;
                await reviewsCollection.insertOne(review);
                res.send(review);
            } else {
                res.send("Unauthorized access");
            }
        });

        //API to post a product 
        app.post("/product", verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const product = req.body;
                await toolsCollection.insertOne(product);
                res.send(product);
            } else {
                res.send("Unauthorized access");
            }
        });

        //API delete a product 
        app.delete("/product/:id", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const id = req.params.id;
                await toolsCollection.deleteOne({ _id: ObjectId(id) });
                res.send("Deleted");
            } else {
                res.send("Unauthorized access");
            }
        });

        //API to update a tool
        // app.put("/tools/:id", verifyJWT, async (req, res) => {
        //     const decodedEmail = req.decoded.email;
        //     const email = req.headers.email;
        //     if (email === decodedEmail) {
        //         const id = req.params.id;
        //         const product = req.body;
        //         const options = { upsert: true };
        //         await toolsCollection.updateOne(
        //             { _id: ObjectId(id) },
        //             {
        //                 $set: {
        //                     availableQuantity: product.newQuantity
        //                 }
        //             },
        //             options
        //         );
        //         res.send(product);
        //     } else {
        //         res.send("Unauthorized access");
        //     }
        // });

        //API to get all user
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })

        //put API to update an user
        app.put("/user/:id", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (email === decodedEmail) {
                const id = req.params.id;
                const user = req.body;
                const options = { upsert: true };
                await userCollection.updateOne(
                    { _id: ObjectId(id) },
                    {
                        $set: {
                            user
                        }
                    },
                    options
                );
                res.send(user);
            } else {
                res.send("Unauthorized access");
            }
        })


        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            console.log(updateProduct);
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    availableQuantity: updateProduct.newQuantity
                }
            }

            const result = await toolsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })

        //API to get blogs 

        app.get("/blogs", async (req, res) => {
            const query = {};
            const blogs = await blogsCollection.find(query).toArray();
            res.send(blogs);
        });

        //token

        app.post('/signin', async (req, res) => {
            const user = req.body;
            console.log(req.body, 'user')

            const getToken = jwt.sign(user, process.env.TOKEN, {
                expiresIn: '1d'
            });

            res.send({ getToken });

        })

    } finally {
        // client.close(); 
    }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));