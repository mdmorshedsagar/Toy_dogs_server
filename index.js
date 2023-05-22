const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//midlware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.3uy5gri.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 12,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyGalley = client.db("toyDogs").collection("Gallery");
    const dbCollection = client.db("toyDogs").collection("subToyesData");
    const toyCollection = client.db("toyDogs").collection("ToyesData");
    
    const indexKeys = { name: 1 };
    const indexOptions = { name: "Toy_name" };
    const result = await toyCollection.createIndex(indexKeys, indexOptions);
    app.get("/allToys", async (req, res) => {
      const limit = 20; 
      const cursor = toyCollection.find().limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/gallery", async (req, res) => {
      const cursor = toyGalley.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.get("/myToys/:email", async (req, res) => {
      const result = await toyCollection
        .find({
          email: req.params.email,
        })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });
    
    
    app.get("/getToysName/:searchToy", async (req, res) => {
      const text = req.params.searchToy;
      console.log(text); 
      const result = await toyCollection
        .find({
          name: { $regex: text, $options: "i" }
        })
        .toArray();
      res.send(result);
    });
    app.post("/addToy", async (req, res) => {
      const newToy = req.body;
      newToy.createdAt = new Date();
      const data = await toyCollection.insertOne(newToy);
      res.send(data);
    });

    app.get("/:category", async (req, res) => {
      const data = await dbCollection
        .find({
          category: req.params.category,
        })
        .toArray();
      res.send(data);
    });

    app.get("/singleSubToy/:id", async (req, res) => {
      const jobs = await dbCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(jobs);
    });
    app.get("/updateToys/:id", async (req, res) => {
      const jobs = await toyCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(jobs);
    });
    app.put('/updateToy/:id', async(req, res) => {
      const id = req.params.id;
      const ids = {_id: new ObjectId(id)}
      const updatedToy = req.body;
      const options = { upsert: true };

      const Toy = {
          $set: {
               name: updatedToy.name,
               picture: updatedToy.picture,
               seller: updatedToy.seller,
               email: updatedToy.email,
               category: updatedToy.category,
               price: updatedToy.price,
               rating: updatedToy.rating,
               quantity: updatedToy.quantity,
               description: updatedToy.description
          }
      }

      const result = await toyCollection.updateOne(ids, Toy, options);
      res.send(result);
  });
      app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })
   
  } finally {
    
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

