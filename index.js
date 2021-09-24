const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6dt9c.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollection = client.db(process.env.DB_NAME).collection("products");

  app.post("/addProducts", (req, res) => {
    const newProduct = req.body;
    console.log("New Event", newProduct);
    productCollection.insertOne(newProduct)
      .then(result => {
        console.log("inserted count", result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/products', (req, res) => {
    productCollection.find()
      .toArray((err, items) => {
        res.send(items);
      })
  })

  app.delete('/deleteProduct/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete event', id);
    productCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(!!documents.value))
  })

});

// Add Orders
client.connect(err => {
  const orderCollection = client.db(process.env.DB_NAME).collection("orders");

  app.post('/addOrders', (req, res) => {
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  app.get('/orders', (req, res) => {
    //console.log(req.query.email)
    orderCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents)
    })
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})