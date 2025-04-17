const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }


    const token = req.headers.authorization?.split(' ')[1] || null;
    console.log('받은 토큰:', token);
    console.log('req.headers:', req.headers);

    if(!token) {
        console.log('토큰 없음');
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        res.locals.user = decoded;
        next();
    } catch (error) {
        console.log('authJWT 에러:', error.name);
        res.locals.user = null;
        next();  // 🔥 에러가 나도 next() 호출
    }

}