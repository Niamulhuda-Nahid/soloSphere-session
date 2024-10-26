const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middlewares
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://solosphere-8d202.web.app"
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      req.user = decoded;
      next()
    });
  };
};



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0puja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const jobsCollection = client.db("soloSphere").collection("jobs");
    const bidsCollection = client.db("soloSphere").collection("bids");

    // jwt token generate
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
      })
        .send({ success: true });
    });

    // clear token from cookie
    app.get('/logout', (req, res) => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0
      })
        .send({ success: true });
    })

    // get all job data from db
    app.get('/jobs', async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    })

    // get a single job data from db by id
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // get jobs data for specific user by email 
    app.get('/jobs/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const TokenEmail = req.user.email;
      if (email !== TokenEmail) {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
      const query = { 'buyer.email': email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    })

    // save a job data to db
    app.post('/job', async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    })

    // update a job data from db by id
    app.put('/job/:id', async (req, res) => {
      const id = req.params.id;
      const updateJobData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...updateJobData
        }
      }
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    })

    // delete a job data from db by id
    app.delete('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    // save a bid data to bd
    app.post('/bid', async (req, res) => {
      const bidData = req.body;
      const query = { email: bidData.email, jobId: bidData.jobId };
      const alreadyApplied = await bidsCollection.findOne(query);
      if (alreadyApplied) {
        return res.status(400).send("You already place a bid in this job.")
      }
      const result = await bidsCollection.insertOne(bidData);
      const updateDoc= {
        $inc: {
          bid_count: 1
        }
      }
      const jobQuery = {_id: new ObjectId(bidData.jobId)}
      const updateBidCount = await jobsCollection.updateOne(jobQuery, updateDoc);
      res.send(result)
    });

    // get my bid from db for specific user by email
    app.get('/bid/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const TokenEmail = req.user.email;
      if (email !== TokenEmail) {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
      const query = { email: email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    // get bid request from db for specific user by email
    app.get('/bid-request/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const TokenEmail = req.user.email;
      if (email !== TokenEmail) {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
      const query = { 'buyer.email': email };
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    // update dib status
    app.patch('/bid/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...status
        }
      }
      const result = await bidsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // pagination
    app.get('/all-jobs', async (req, res) => {
      const page = parseInt(req.query.page) - 1;
      const size = parseInt(req.query.size);
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;

      let query = {
        job_title: { $regex: search, $options: 'i' }
      };
      if (filter) {
        query = { ...query, category: filter }
      }
      let options = {}
      if (sort) {
        options = { sort: { deadline: sort === 'asc' ? 1 : -1 } }
      }
      const result = await jobsCollection.find(query, options).skip(page * size).limit(size).toArray();
      res.send(result);
    })

    // gate total jobs number from db
    app.get('/item-count', async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        job_title: {$regex: search, $options: 'i'}
      };
      if (filter) {
        query = { ...query, category: filter }
      }
      const count = await jobsCollection.countDocuments(query);
      res.send({ count })
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("soloSphere server running")
})

app.listen(port, () => {
  console.log(`soloSphere server running on PORT: ${port}`)
})