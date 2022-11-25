const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();

// middle wear
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a31ucvz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoryCollection = client.db("nextCarSell").collection("category");
    const categoryDetailsCollection = client
      .db("nextCarSell")
      .collection("categoryDetails");
    const bookingsCollection = client
      .db("nextCarSell")
      .collection("bookings");
    const usersCollection = client
      .db("nextCarSell")
      .collection("users");
    const addProductCollection = client
      .db("nextCarSell")
      .collection("addProduct");

      // JWT token
      app.get('/jwt', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        if (user) {
            const token = jwt.sign({ email }, process.env.TOKEN, { expiresIn: '1h' })
            return res.send({ accessToken: token });
        }
        console.log(user);
        res.status(403).send({ accessToken: '' })
    });

    // get data from signup
    app.post('/users', async(req,res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
      console.log(result);
    });

    // get home page category api
    app.get("/category", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    // category details api
    app.get("/categoryDetails/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const filter = { category_id: id };
      const result = await categoryDetailsCollection.find(filter).toArray();
      res.send(result);
    });

    // post from modal 
    app.post('/bookings', async(req,res) => {
        const bookings = req.body;
        const result = await bookingsCollection.insertOne(bookings);
        res.send(result);
    });

    // get my orders api
    app.get('/bookings', async (req,res) => {
        const bookings = req.body;
        const result = await bookingsCollection.find(bookings).toArray();
        res.send(result);
    });

    // add product 
    app.post('/addProduct', async(req,res) => {
        const product = req.body;
        const result = await addProductCollection.insertOne(product);
        res.send(result);
    });

  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("you hit the road server is running..");
});

app.listen(port, () => {
  console.log(`your hit the road server is running port ${port}`);
});
