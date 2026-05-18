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
        const ideaCollections = db.collection('ideas');
        const ideaCommentsCollections = db.collection('idea_comments');

        // Interacting with ideas ( collection = ideas )

        // getting all data of idea collection
        app.get('/ideas', async (req, res) => {

            const data = await ideaCollections.find().toArray()
            res.json(data);
        });

        // getting one idea based on the id
        app.get('/ideas/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ideaCollections.findOne(query);

            if (!result) {
                return res.status(404).json({ message: "Idea not found" });
            }

            res.json(result);

        });

        // Getting own created idea for my-idea page
        app.get('/my-ideas', async (req, res) => {

            const authorId = req.query.authorId;

            let query = {};
            if (authorId) {
                query = { authorId: authorId };
            }


            const result = await ideaCollections.find(query).toArray();
            res.send(result);

        });


        // Delete my ideas

        app.delete('/ideas/:id', async (req, res) => {
            const ideaId = await req.params.id;
            const query = await { _id: new ObjectId(ideaId) }

            // const comment = await req.body;
            const result = await ideaCollections.deleteOne(query)
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: "Comment not found" });
            }

            return res.status(200).json({ success: true, deletedCount: result.deletedCount });

        });

        app.patch('/ideas/:id', async (req, res) => {
            const ideaId = req.params.id
            const query = { _id: new ObjectId(ideaId) }
            const updateText = {
                $set: req.body
            }

            const result = await ideaCollections.updateOne(query, updateText);
            // res.json(result)

            if (!result) {
                return res.status(404).json({ message: "Idea not found" });
            }

            res.json(result);
        })



        // Getting trending ideas
        app.get('/ideas-for-home', async (req, res) => {

            const data = await ideaCollections.find().limit(6).toArray()
            res.json(data);
        })


        // Adding one idea based on the id
        app.post('/ideas', async (req, res) => {
            const idea = await req.body;
            // console.log( idea , ' Idea found in backend ')
            const result = await ideaCollections.insertOne(idea);
            res.json(result)
        })


        // Interacting with user comments in an idea ( collection = idea_comments)


        // Getting comments filtered by ideaId
        app.get('/comments', async (req, res) => {
            try {
                const { ideaId } = req.query;

                const query = ideaId ? { ideaId: ideaId } : {};

                const data = await ideaCommentsCollections.find(query).toArray();
                res.json(data);
            } catch (error) {
                console.error("Error fetching comments:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });


        // adding comment
        app.post('/add-comments', async (req, res) => {
            const comment = await req.body;
            // console.log(comment, " Comment in backend ")
            const result = await ideaCommentsCollections.insertOne(comment);
            // res.json(result)

            if (!result) {
                return res.status(404).json({ message: "Idea not found" });
            }

            res.json(result);
        })

        // Delete commnt BTW
        app.delete('/delete-comment/:id', async (req, res) => {
            const commentId = await req.params.id;
            // const query = await {_id: new ObjectId(commentId)}
            const query = { id: parseInt(commentId) };

            // const comment = await req.body;
            const result = await ideaCommentsCollections.deleteOne(query)
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: "Comment not found" });
            }

            return res.status(200).json({ success: true, deletedCount: result.deletedCount });

        })


        // Edit comment

        app.patch('/edit-comment/:id', async (req, res) => {
            const commentId = req.params.id
            const { text } = req.body;

            const query = { id: parseInt(commentId) }
            const updateText = {
                $set: { text: text }
            }

            const result = await ideaCommentsCollections.updateOne(query, updateText);
            // res.json(result)

            if (!result) {
                return res.status(404).json({ message: "Idea not found" });
            }

            res.json(result);
        })

        // Get Ideas That The Spasific User Interacted With Commenting
        app.get('/my-interactions', async (req, res) => {
            const authorId = req.query.authorId;

            const userComments = await ideaCommentsCollections.find({ authorId: authorId }).toArray();
            const ideaIds = [...new Set(userComments.map(comment => comment.ideaId))];

            const ObjectIds = ideaIds.map(id => new ObjectId(id));
            const result = await ideaCollections.find({ _id: { $in: ObjectIds } }).toArray();
            
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


