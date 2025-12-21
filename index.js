const express = require('express')
const app = express()
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()
const userRoute = require('./routes/userRoutes.js')
const periodRoute = require('./routes/periodRoutes.js')
const connectDB = require("./config/db.js")
connectDB()
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/user', userRoute)
app.use('/period',periodRoute)



app.get('/', (req, res) => {
    res.send('App is working perfectly')
})

const port = process.env.PORT
app.listen(port, (err) => {
    if (err) {
        console.log('error: Server cannot start now');

    } else {
        console.log(`msg: Server running on ${port} !`);
    }
})