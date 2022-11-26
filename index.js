const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require("dotenv").config();
const stripe = require("stripe")(process.env.KEY);

// middle wear
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a31ucvz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


// jwt middle wear
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })
};

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
    const homesCollection = client
      .db("nextCarSell")
      .collection("homes");
    const paymentsCollection = client
      .db("nextCarSell")
      .collection("payments");
    // const addProductCollection = client
    //   .db("nextCarSell")
    //   .collection("addProduct");

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
      // console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
      // console.log(result);
    });

    // get home page category api
    app.get("/category",  async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    // category details api
    app.get("/categoryDetails/:category", async (req, res) => {
      const product = req.params.category;
      console.log(product)
      const filter = { category_id: product };
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
        const bookings = req.query.email;
      //   const decodedEmail = req.decoded.email;
      //   const query = { email: decodedEmail };
      //   const user = await usersCollection.findOne(query);
      // console.log(user);
      //   if (user?.role === "Buyer") {
      //     return res.status(401).send({ message: "forbidden r access" });
      //   };
        const filter = {email : bookings}
        const result = await bookingsCollection.find(filter).toArray();
        res.send(result);

        // console.log(bookings);
       
        // console.log(result);
    });

    // add product 
    app.post('/addProduct', async(req,res) => {
        const product = req.body;
        const result = await categoryDetailsCollection.insertOne(product);
        res.send(result);
    });

    // my product get by email
    app.get('/myProduct', async (req,res) => {
      const email = req.query.email;
      const filter = {email : email};
      const result = await categoryDetailsCollection.find(filter).toArray();
      res.send(result);
    });

    // my product delete 
    app.delete('/myProduct/:id', async (req,res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await categoryDetailsCollection.deleteOne(query);
      res.send(result);
    });

    // home page products api
    app.post('/homeProducts', async (req,res) => {
      const homePage = req.body;
      const result = await homesCollection.insertOne(homePage);
      res.send(result);
    });

    app.get('/homeProducts', async (req,res) => {
      const email = req.query.email;
      const home = {email : email};
      const result = await homesCollection.find(home).toArray();
      res.send(result);
    });

      // payment intention
      app.post('/create-payment-intent', async (req,res) => {
        const booking = req.body;
        const price = booking.price;
        const amount = price * 100;
  
        const paymentIntent = await stripe.paymentIntents.create({
          currency: "usd",
          amount,
          "payment_method_types": [
            "card"
          ],
        });
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });

      // payment
      app.post('/payment', async (req,res) => {
        const payment = req.body;
        const result = await paymentsCollection.insertOne(payment);
  
        const id = payment.bookingId
              const filter = {_id: ObjectId(id)}
              const updatedDoc = {
                  $set: {
                      paid: true,
                      transactionId: payment.transactionId
                  }
              }
              const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
              console.log(result,'and', updatedResult)
        res.send(result);
      });

    // app.get("/users/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email };
    //   const user = await usersCollection.findOne(query);
    //   // console.log(user,email)
    //   res.send({ isAdmin: user?.role === 'admin' });
    // });

    // app.get('/seller' , async(req,res) => {
    //     const filter = {};
    //     const option = {upsert : true};
    //     const updateDoc = {
    //       $set: {
    //         email : ''
    //       }
    //     };
    //     const result = await categoryDetailsCollection.updateMany(filter,updateDoc,option);
    //     res.send(result);
    //     console.log(result);
    //   });

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
