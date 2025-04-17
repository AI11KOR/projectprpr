
module.exports = (req, res, next) => {
    if(!req.user) {
        if(req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ message: '로그인이 필요합니다.' })
           
        }
        console.log(req.user)
    }
    next();
}