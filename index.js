const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wear
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a31ucvz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const categoryCollection = client.db("nextCarSell").collection("category");
    const categoryDetailsCollection = client.db("nextCarSell").collection("categoryDetails");

    // get home page category 
    app.get("/category", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
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
