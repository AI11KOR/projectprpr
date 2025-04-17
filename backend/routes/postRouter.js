const express = require('express');
const router = express.Router();
const postCtrl = require('../controller/postController');
const checkJWTLogin = require('../middleware/checkJWTLogin');
const checkPostAuthor = require('../middleware/checkPostAuthor')
const authJWT = require('../middleware/authJWT')
const {upload} = require('../middleware/S3_upload')

router.get('/list', postCtrl.list);

router.post('/write', authJWT, checkJWTLogin, upload.single('image'), postCtrl.write);

router.get('/detail/:id', postCtrl.detailPage);

router.post('/edit/:id', authJWT, checkJWTLogin, checkPostAuthor, upload.single('image'), postCtrl.edit);

router.delete('/delete/:id', authJWT, checkJWTLogin, checkPostAuthor, postCtrl.delete);

router.post('/like/:id', authJWT, checkJWTLogin, postCtrl.likePost);

router.post('/comment/:id', authJWT, checkJWTLogin, postCtrl.comment);

router.delete('/comment/:postId/:commentId', authJWT, checkJWTLogin, postCtrl.commentDelete)



module.exports = router;