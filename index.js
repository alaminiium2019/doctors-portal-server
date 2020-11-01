const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zce5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json())
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());


const port = 5000;
app.get('/', (req, res) => {
    res.send("Hello from DB")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorPortal").collection("appointments");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/appointmentByDate', (req, res) => {
        const date = req.body;
        console.log(date.date);
        appointmentCollection.find({date: date.date})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/appointments', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addDoctor',(req,res) => {
        const file = req.files.file;

        const name = req.body.name;
        const email = req.body.email;
        console.log(name,email,file);
        file.mv(`${__dirname}/doctors/${file.name}`,err =>{
            if(err){
                console.log(err);
                return res.status(500).send({msg: 'Faild to upload Image'})
            }
            return res.send({name: file.name, path: `${file.name}`})
        })

    })

    console.log("Database is connected..")
});

app.listen(process.env.PORT || port);