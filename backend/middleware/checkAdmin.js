

module.exports = (req, res, next) => {
    if(req.user?.email === 'admin@example.com') {
        return next(); // 관리자 통과
    }

    return res.status(403).json({ message: '관리자 권한이 필요합니다.' })
}