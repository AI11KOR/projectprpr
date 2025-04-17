const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const { handleOAuthCallback } = require('../controller/socialController');
require('dotenv').config();

passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,
    callbackURL: process.env.KAKAO_CLIENT_CALLBACK,
}, handleOAuthCallback ));