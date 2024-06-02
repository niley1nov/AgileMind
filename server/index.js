import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import config from './config.js';

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware to parse body in json format
app.use(bodyParser.json());

app.get('/',function(req,res){
    res.json({'Test': 'TEST'});
})


//Connect to MongoDB
mongoose.connect(config.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('MongoDB connection error:', error.message);
});


// Start server on the given port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
