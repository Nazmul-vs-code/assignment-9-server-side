const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        await client.connect();


        const db = client.db('ideavault');
        const ideaCollactions = db.collection('ideas');
        
        // Interacting with ideas ( collection )
        app.get('/ideas', async (req , res) => {
            
            const data = await ideaCollactions.find().toArray()
            res.json(data);
        } )

        
        app.get('/ideas-for-home', async (req , res) => {
            
            const data = await ideaCollactions.find().limit(6).toArray()
            res.json(data);
        } )



            await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
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


