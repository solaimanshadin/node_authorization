const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId =  require('mongodb').ObjectId
const admin = require('firebase-admin');

const app = express();
app.use(cors());

app.use(bodyParser.json());
var serviceAccount = require("./awsome-site-firebase-adminsdk-t8ke7-69dfb9e187.json");

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://awsome-site.firebaseio.com"
});
const uri = "mongodb://localhost:27017/demo";
let client = new MongoClient(uri ,{useNewUrlParser:true, useUnifiedTopology: true})

const authUser = (req, res, next) => {
    // console.log(req);
    // return
    // idToken comes from the client app
    admin.auth().verifyIdToken(req.headers.authorization)
    .then(function(decodedToken) {
        let uid = decodedToken.uid;
        next();
    })
    .catch(function(error) {
        res.status(401).send("Unauthorized !!!")
    });
}

const authAdmin = (req, res, next) => {
    // console.log(req);
    // return
    // idToken comes from the client app
    admin.auth().verifyIdToken(req.headers.authorization)
    .then(function(decodedToken) {
        let email = decodedToken.email;
        if(email === 'shadin@programming-hero.com'){
            next();
        }else{
            res.status(401).send("Not enough permission !!!")
        }
    })
    .catch(function(error) {
        res.status(401).send("Unauthorized !!!")
    });
}


client.connect(err => {
    if(err){
        console.log(err);
    }else{
        const review = client.db('demo').collection('review');
        const product = client.db('demo').collection('products');

        app.get("/" , (re1, res) => {
            res.send("welcome home")
        })

        app.get('/products', (req, res) => {
            product.find().toArray((rej,documents) => {
                if(rej){
                    console.log(rej);
                    res.status(500).send("Filed to Fetch Data ")
                }else{
                    res.send(documents);
                }
                client.close()
            })
        })

        app.post('/add-review' , authUser, (req,res) => {
            const data = req.body;
            console.log(data)
            review.insertOne(data, (err , result) => {
                if(err) {

                    res.status(500).send({message : err})
                }else{
                    res.send(result.ops[0])
                }

            })
        
        })

        app.post('/add-product' , authAdmin, (req,res) => {
            const data = req.body;
            console.log(data)
            product.insertOne(data, (err , result) => {
                if(err) {

                    res.status(500).send({message : err})
                }else{
                    res.send(result.ops[0])
                }

            })
        
        })
        

       
        
    }
})



app.listen(8080, err => {
    err ? console.log(err) : console.log("Listing for port 8080" );
})