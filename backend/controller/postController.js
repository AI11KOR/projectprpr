const express = require('express');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/database');
const { ObjectId } = require('mongodb')
const { upload, deleteFromS3 } = require('../middleware/S3_upload')

exports.list = async (req, res) => {
    try {
        const db = await connectDB();
        
        const perPage = 5;
        const currentPage = parseInt(req.query.page) || 1;

        // 정렬 기준: 최신순 또는 인기순 -1을 하면 내림차순으로 된다 큰값 => 작은 값
        const sortOption = req.query.sort === 'likes' ? { likes: - 1 } : { writeDate: -1 };

        const totalCount = await db.collection('post').countDocuments();
        const totalPage = Math.ceil(totalCount / perPage)

        let result = await db.collection('post')
        .find()
        // .sort(sortOption) // 최신순 정렬
        .sort({ isAdmin: -1, ...sortOption }) // 🔥 관리자 글 먼저, 그다음 최신순
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .toArray();

        // 댓글 개수 추가
        result = result.map(post => ({
            ...post,
            commentCount: post.comments ? post.comments.length : 0
        }))

        res.status(200).json({posts: result, totalPage: totalPage})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러:', error })
    }
}

exports.write = async (req, res) => {
    try {
        const db = await connectDB();
        const {title, content} = req.body;
        if(!title || !content) {
            return res.status(400).json({ message: '내용을 적어주세요' })
        }
        const imageURL = req.file?.location || null;
        const imageKey = req.file?.key || null;
        const isAdmin = req.user?.email === 'admin@example.com';

        await db.collection('post').insertOne({ 
            title, content, imageURL, imageKey,  // ✅ S3 삭제용 key 필수!
            userId: req.user._id, email:req.user.email, 
            isAdmin: isAdmin, // 관리자 글 여부
            writeDate: new Date(), 
            likes: 0,
            likedUsers: [],
            comments: []
        })
        res.status(200).json({ message: '저장되었습니다.' })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러:', error })
    }
}

exports.detailPage = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;
        let result = await db.collection('post').findOne({ _id: new ObjectId(postId) })
        if(!result) {
            return res.status(404).json({ message: '게시글이 없습니다.' })
        }


        // ✅ 누락 방지 기본값 설정
        result.likes = result.likes || 0;
        result.likedUsers = result.likedUsers || [];
        result.comments = result.comments || [];

        // if (result.likes === undefined) {
        //     result.likes = 0;
        //   }
        //   if (result.likedUsers === undefined) {
        //     result.likedUsers = [];
        //   }

        res.status(200).json(result);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러:', error })
    }
    

}

exports.editPage = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;
        let result = await db.collection('post').findOne({ _id: new ObjectId(postId) })
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러:', error })
    }
}

exports.edit = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;
        const { title, content } = req.body;
        const imageURL = req.file?.location || null;

        const updateData = { title, content, updateDate: new Date() };

        // 안바뀌면 그대로 둠
        if(imageURL) {
            updateData.imageURL = imageURL;
        }

        await db.collection('post').updateOne({ _id: new ObjectId(postId) },
    {$set : updateData })
        res.status(200).json({message: '업데이트 완료' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러:', error })
    }
}

exports.delete = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id

        const post = await db.collection('post').findOne({ _id: new ObjectId(postId) });

        // 이미지 있는 경우 삭제
        if(post?.imageKey) {
            await deleteFromS3(post.imageKey);
        }
        console.log('삭제 대상 게시글:', post);
        console.log('삭제할 S3 키:', post?.imageKey);
        await db.collection('post').deleteOne({ _id: new ObjectId(postId) })
        res.status(200).json({message: '삭제 성공'})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러:', error })
    }
}

exports.likePost = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await db.collection('post').findOne({ _id: new ObjectId(postId) })

        if(!post) {
            return res.status(404).json({ message: '게시글이 없습니다.' })
        }

        if(post.likedUsers.includes(userId)) {
            return res.status(400).json({ message: '이미 좋아요를 눌렀어요' });
        }

        await db.collection('post').updateOne({ _id: new ObjectId(postId) },
        { $inc: { likes: 1 }, $push: { likedUsers: userId } })

        res.status(200).json({ message: '좋아요'})
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: '서버 에러' });
    }
}

exports.comment = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.params.id
        const { text } = req.body;
        const userId = req.user._id;
        const email = req.user.email;

        const comment = { _id: new ObjectId(), userId, email, text, createdAt: new Date() };
        
        await db.collection('post').updateOne({ _id: new ObjectId(postId) },
        { $push: { comments: comment }}
    )
        res.status(200).json({ message: '댓글 작성 완료' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '댓글 기능에 에러가 생겼어요:', error })
    }
}

exports.commentDelete = async (req, res) => {
    try {
        const db = await connectDB();
        const {postId, commentId} = req.params; // postId: 게시글 찾는 용도, commentId: 해당 게시글 안에서 삭제할 댓글 찾는 용도
        await db.collection('post').updateOne({ _id: new ObjectId(postId) },
        { $pull: { comments: { _id: new ObjectId(commentId) } } } // 배열 요소를 조건에 따라 제거, comments 배열 안에서 _id가 commentId인 객체를 제거
    )

    res.status(200).json({ message: '댓글 삭제 완료'})
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '댓글 삭제 중 에러 발생', error })
    }
}

// exports.commentUpdate = async (req, res) => {
//     try {
//         const db = await connectDB();
//         const postId = req.params.id;
//         const {text} = req.body;
//         await db.collection('post').updateOne({ _id: new ObjectId(postId) },
//         { $set: { text, updateDate: new Date() }}
//     )
//     } catch(error) {
//         console.log(error);
//         res.status(500).json({ message: '수정하지 못했어요' })
//     }
// }   