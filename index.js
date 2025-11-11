const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://mongoDB:TThFI8ILCUpPlKKT@cluster0.v5gbx4z.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const db = client.db("utility_bill");
    const productsCollection = db.collection("bills");
    const paymentInfo = db.collection("payment");
    const usersCollection = db.collection("users");

    // get users
    app.post("/users", async (req, res) => {
      const newUsers = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send("user already exits, do not need to add again.");
      } else {
        const result = await usersCollection.insertOne(newUsers);
        res.send(result);
      }
    });

    // getAll
    app.get("/bills", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // latest bills
    app.get("/latest-bills", async (req, res) => {
      const cursor = productsCollection.find().sort({ data: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    // getOne
    app.get("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });
    // include
    app.post("/bills", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });
    // update
    app.patch("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          category: updatedProduct.catch,
          amount: updatedProduct.amount,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });
    // deleteOne
    app.delete("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // recorded_info
    app.get("/payment", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = await paymentInfo.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/payment", async (req, res) => {
      const newPayment = req.body;
      const result = await paymentInfo.insertOne(newPayment);
      res.send(result);
    });

    // update
    app.patch("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const updatedPayment = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          category: updatedPayment.catch,
          amount: updatedPayment.amount,
        },
      };
      const result = await paymentInfo.updateOne(query, update);
      res.send(result);
    });
    // deleteOne
    app.delete("/bills/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await paymentInfo.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Smart server is running");
});

app.listen(port, () => {
  console.log(`Smart server in running on port: ${port}`);
});
