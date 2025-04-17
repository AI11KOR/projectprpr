const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (userId, userEmail) => {
    return jwt.sign({ _id: userId, email: userEmail }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    })
}

module.exports = generateToken;