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
    // getAll
    app.get("/bills", async (req, res) => {
      const cursor = productsCollection.find().sort({ date: -1 });
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

    client.db("admin").command({ ping: 1 });
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
