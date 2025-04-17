const connectDB = require('../config/database');
const generateToken = require('../utils/jwtUtils');

const handleOAuthCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('🔥 소셜 프로필:', profile);

        const db = await connectDB();
        const users = db.collection('user');

        // ✅ provider별 정보 정리
        let userEmail = '';
        let userName = '';

        if (profile.provider === 'kakao') {
            userEmail = profile._json?.kakao_account?.email || '';
            userName = profile._json?.kakao_account?.profile?.nickname || profile.displayName || '카카오유저';
        } else if (profile.provider === 'naver') {
            userEmail = profile._json?.email || profile.emails?.[0]?.value || '';
            userName = profile._json?.nickname || profile.displayName || '네이버유저';
        } else if (profile.provider === 'google') {
            userEmail = profile.emails?.[0]?.value || '';
            userName = profile.displayName || '구글유저';
        }

        let user = await users.findOne({ socialId: profile.id, provider: profile.provider });

        if (!user) {
            const newUser = {
                userName,
                userEmail,
                socialId: profile.id,
                provider: profile.provider,
                createdAt: new Date(),
            };

            const result = await users.insertOne(newUser);
            user = { ...newUser, _id: result.insertedId };
        }

        const token = generateToken({ id: user._id.toString(), userName: user.userName, userEmail: user.userEmail });
        user.token = token;
        user.userEmail = userEmail;

        return done(null, user);
    } catch (error) {
        console.error('login failed:', error);
        return done(error, false);
    }
};

module.exports = { handleOAuthCallback };
