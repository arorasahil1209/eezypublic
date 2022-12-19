let express = require('express');
let cors = require('cors');

let mongoose = require('mongoose');
let userAuth = require('./router/user');
let customer = require('./router/customer');
let order = require('./router/order');
let bodyParser = require('body-parser');


const Config = require('./config/dev.json');
let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}))

const uri = Config.mongourilocal;

mongoose.connect(uri).then((response)=>{
    console.log(`connection eastablished with the database`)
}).catch((error)=>{
    console.log(`issues while connecting with the db`,error)
})





app.use(userAuth);
app.use(customer);
app.use(order);
app.listen(Config.port,()=>{
    console.log('app is running at',Config.port);
});

