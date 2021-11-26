const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// Variables
const databaseName = "dohar_travel_booking";
const collectionName = { destination: "destination", orders: "orders" };

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1d7zy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const PORT = process.env.PORT || 5000;

const run = async () => {
  try {
    await client.connect();
    console.log("mongoDB connected...");
    const db = client.db(databaseName);
    const destCollection = db.collection(collectionName.destination);
    const ordersCollection = db.collection(collectionName.orders);

    // Live Server Test
    app.get("/", (req, res) => {
      res.send("Server Is Running");
    });

    // GET OPERATION
    app.get("/destinations", async (req, res) => {
      const cursor = destCollection.find({});
      const destinations = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        destinations,
      });
    });

    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const orders = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        orders,
      });
    });

    // UPDATE OPERATION SINGLE USER ORDERS
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `done`
        },
      };
      const orders = ordersCollection.updateOne(query,updateDoc,options);
      res.send(orders);
    });


    // CREATE OPERATION FOR DESTINATION
    app.post("/orders", async (req, res) => {
      const data = req.body;
      const insertResult = await ordersCollection.insertOne(data);
      res.send(insertResult);
    });

    // CREATE OPERATION FOR USERS ORDER

    app.post("/destination", async (req, res) => {
      const data = req.body;
      const insertResult = await destCollection.insertOne(data);
      console.log('hit');
      res.send(insertResult);
    });

   
    // DELETE OPERATION FOR USERS ORDERS

    app.delete("/orders/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const usersOrders = ordersCollection.deleteOne(query);
      res.send(usersOrders);
    });
  } finally {
    // await client.close();
  }
};

run().catch((err) => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server start on: http://localhost:${PORT}`);
});
