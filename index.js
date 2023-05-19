const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT ||5000;

//midlware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://toyDogs:hFgT6SPhW19AmIip@cluster0.3uy5gri.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// toyDogs
//hFgT6SPhW19AmIip
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const dbCollection = client.db("toyDogs").collection("subToyesData");
   
    app.get("/:category", async (req, res) => {
        
        const data = await dbCollection.find({
            category: req.params.category,
          })
          .toArray();
        res.send(data);
      });
   
      app.get("/singleToy/:id", async (req, res) => {
       
        const jobs = await dbCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(jobs);
      });
    await client.db("admin").command({ ping: 1 });
  
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})