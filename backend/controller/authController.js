const express = require('express');
const bcrypt = require('bcrypt');
const connectDB = require('../config/database')
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/jwtUtils');

exports.login = async (req, res) => {
    try {
        const db = await connectDB();
        const { email, password } = req.body;
        if(!email || !password ) {
            return res.status(400).json({ message: '기입해 주세요' })
        }
        const userEmail = await db.collection('user').findOne({ email })
        if(!userEmail) {
            return res.status(401).json({ message: '존재하는 회원이 없습니다.' })
        }
        const isValid = await bcrypt.compare(password, userEmail.password)
        if(!isValid) {
            return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.'})
        }

        // const token = jwt.sign({
        //     id: userEmail.email, 
        // }, process.env.JWT_SECRET, { expiresIn: '1h'  })
        const token = generateToken(userEmail._id, userEmail.email);

        res.status(200).json({ message: '로그인 성공', token, email: userEmail.email })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러:', error })
    }
    
}

exports.register = async (req, res) => {
    try {
        const db = await connectDB();
        const {email, password, address, postcode, detailAddr = '' } = req.body;
        if(!email || !password || !address || !postcode || !detailAddr) {
            return res.status(400).json({ message: '글자를 적어주세요' })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingEmail = await db.collection('user').findOne({ email })
        if(existingEmail) {
            return res.status(401).json({ message: '이미 가입된 이메일이 있습니다.' })
        }

        await db.collection('user').insertOne({
            email, password: hashedPassword, address, postcode, detailAddr, RegisterDate: new Date()
        })
        res.status(200).json({ message: '회원가입 성공' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러:', error })
    }
}