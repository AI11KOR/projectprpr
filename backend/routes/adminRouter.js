const express = require('express');
const router = express.Router();
const adminCtrl = require('../controller/adminController');
const authJWT = require('../middleware/authJWT');
const checkJWTLogin = require('../middleware/checkJWTLogin');
const isAdmin = require('../middleware/checkAdmin');
const { upload } = require('../middleware/S3_upload');


// 관리자 페이지
router.get('/dashboard', authJWT, isAdmin, adminCtrl.adminDashBoard);

// 관리자 글쓰기
router.post('/write', authJWT, checkJWTLogin, isAdmin, upload.single('image'), adminCtrl.adminWrite);

// 관리자 글 수정
router.get('/edit/:id', authJWT, checkJWTLogin, isAdmin, adminCtrl.adminEditPage);
router.post('/edit/:id', authJWT, checkJWTLogin, isAdmin, upload.single('image'), adminCtrl.adminEdit);

// 관리자 글 삭제
router.delete('/delete/:id', authJWT, isAdmin, adminCtrl.adminDelete);



module.exports = router;