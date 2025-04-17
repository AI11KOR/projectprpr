const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const connectDB = require('../config/database');
const { handleOAuthCallback } = require('../controller/socialController');
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CLIENT_CALLBACK,
}, handleOAuthCallback))