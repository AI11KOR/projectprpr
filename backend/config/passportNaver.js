const passport = require('passport');
const naverStrategy = require('passport-naver').Strategy;
const { handleOAuthCallback } = require('../controller/socialController')
require('dotenv').config();

passport.use(new naverStrategy({
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_CLIENT_CALLBACK,
}, handleOAuthCallback ));