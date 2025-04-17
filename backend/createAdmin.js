// 관리자 계정을 db에 저장하기 위해서 일부러 만듦
// 이렇게 설정하고 node createAdmin.js 를 하면 try문의 관리자 계정 생성완료! 라고 뜨게되면 자동으로 db에 저장이 된다

const bcrypt = require('bcrypt');
const connectDB = require('./config/database');

const createAdminUser = async () => {
    const db = await connectDB();

    const email = 'admin@example.com';
    const password = 'Admin1234!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        email,
        password: hashedPassword,
        userName: '관리자',
        createdAt: new Date()
    };

    try {
        await db.collection('user').insertOne(user);
        console.log('✅ 관리자 계정 생성 완료!');
    } catch (error) {
        console.error('❌ 관리자 계정 생성 실패:', error);

    }
}

createAdminUser();