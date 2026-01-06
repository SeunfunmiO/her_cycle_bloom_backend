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
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use('/user', userRoute)
app.use('/period', periodRoute)


app.use((err, req, res, next) => {
    if (err.type === "Entity is too large") {
        return res.status(413).json({
            message: "Payload is too large, Image exceeds required size"
        })
    }
    next(err)
})


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