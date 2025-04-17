const express = require('express');
const connectDB = require('../config/database');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { deleteFromS3 } = require('../middleware/S3_upload');


exports.adminDashBoard = async (req, res) => {
    try {
        const db = await connectDB();
        const posts = await db.collection('post')
        .find()
        .sort({ writeDate: -1 }) // 최신순
        .limit(10) // 최근 10개만
        .toArray();

        res.status(200).json(posts);
    } catch (error) {
        console.log('관리자 대시보드 오류:', error);
        res.status(500).json({ message: '서버 에러:', error });
    }
}

exports.adminWrite = async (req, res) => {

}

exports.adminEditPage = async (req, res) => {

}

exports.adminEdit = async (req, res) => {

}

exports.adminDelete = async (req, res,) => {
    try {
        const db = await connectDB();
        const postId = req.params.id;

        const post = await db.collection('post').findOne({ _id: new ObjectId(postId) });

        if(post?.imageKey) {
            await deleteFromS3(post.imageKey);
        }

        await db.collection('post').deleteOne({ _id: new ObjectId(postId) });
        res.status(200).json({ message: '삭제 완료' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러:', error })
    }
}


