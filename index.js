const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require("dotenv").config()
app.use(express.json());
app.use(cors())

const uri = process.env.MONGODB_URI;



const port = process.env.PORT

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // await client.connect();


        const db = client.db('ideavault');
        const ideaCollactions = db.collection('ideas');

        // Interacting with ideas ( collection )

        // getting all data of idea collection
        app.get('/ideas', async (req, res) => {

            const data = await ideaCollactions.find().toArray()
            res.json(data);
        });

        // getting one idea based on the id
        app.get('/ideas/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ideaCollactions.findOne(query);

            if (!result) {
                return res.status(404).json({ message: "Idea not found" });
            }

            res.json(result);

        })

        // Getting trending ideas
        app.get('/ideas-for-home', async (req, res) => {

            const data = await ideaCollactions.find().limit(6).toArray()
            res.json(data);
        })


        // Adding one idea based on the id
        app.post('/ideas', async (req, res) => {
            const idea = await req.body;
            console.log( idea , ' Idea found in backend ')
            const result = await ideaCollactions.insertOne( idea );
            res.json(result)
        })




        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})



app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})


