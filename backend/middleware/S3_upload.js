const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEY,
      secretAccessKey : process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'woohyunapple',
    key: function (req, file, done) {
        const ext = path.extname(file.originalname);
        const filename = Date.now().toString() + ext
      done(null, filename) //업로드시 파일명 변경가능
    }
  })
});

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: 'woohyunapple',
    Key: key,
  });

  try {
    await s3.send(command);
    console.log('S3 파일 삭제 성공:', key)
  } catch (error) {
    console.log('S3 파일 삭제 실패:', error)
  }
}

module.exports = {
  upload, 
  deleteFromS3
};