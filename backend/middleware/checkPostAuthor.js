const connectDB = require('../config/database');
const { ObjectId } = require('mongodb');

module.exports = async (req, res, next) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;

        const post = await db.collection('post').findOne({ _id: new ObjectId(postId) });

        if(!post) {
            return res.status(404).json({ message: '게시글이 존재하지 않습니다.' })
        }


        // 👇 userId와 토큰의 _id를 문자열로 비교
        if(post.userId.toString() !== req.user._id) {
            return res.status(403).json({ message: '본인글만 수정 또는 삭제할 수 있습니다.' });
        }
        next();
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러' })
    }
}