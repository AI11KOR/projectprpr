const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
const cors = require('cors')
const PORT = process.env.PORT || 8000;
const session = require('express-session')

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
  }));

const authRouter = require('./routes/authRouter');
const postRouter = require('./routes/postRouter');
const adminRouter = require('./routes/adminRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', authRouter);
app.use('/api', postRouter);
app.use('/api/admin', adminRouter);

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})