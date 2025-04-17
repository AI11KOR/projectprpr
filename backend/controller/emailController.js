const nodemailer = require('nodemailer');
require('dotenv').config();
const connectDB = require('../config/database');


exports.sendBtn = async (req, res) => {
    const email = req.body.email;
    const db = await connectDB();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if(!email) {
        return res.status(400).json({ message: '이메일을 적어주세요' })
    }

    const transporter = nodemailer.createTransport({
        service: 'naver',
        auth: {
            user: process.env.NAVER_USER,
            pass: process.env.NAVER_PASS
        }
    })

    const emailOptions = {
        from: process.env.NAVER_USER,
        to: email,
        subject: '인증번호',
        text: `인증번호는 ${code} 입니다.`
    }

    try {
        await transporter.sendMail(emailOptions)
        await db.collection('emailCodes').deleteMany({ email });
        await db.collection('emailCodes').insertOne({
            email, code, createdAt: new Date()
        })

        return res.status(200).json({ message: '인증번호 성공' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: '서버 오류 에러' })
    }
}

exports.verifyBtn = async (req, res) => {
    const {email, code} = req.body;
    const db = await connectDB()

    const record = await db.collection('emailCodes').findOne({ email, code });


    if(!record) {
        return res.status(400).json({ message: '인증번호가 일치하지 않습니다.' })
    }

    const now = new Date();
    const created = new Date(record.createdAt);
    const diff = (now - created) / 1000;

    if(diff > 180) {
        await db.collection('emailCodes').deleteOne({ _id: record._id });
        return res.status(400).json({ message: '인증번호가 완료되었습니다.' })
    } else {
        await db.collection('emailCodes').deleteOne({ _id: record._id })
        return res.status(200).json({ message: '연결 성공' })
    }
}