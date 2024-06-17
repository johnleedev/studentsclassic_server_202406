const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

// 계정별로 레슨 기록 가져오기
router.get('/notes/:user', (req, res) => {
  var userAccount = req.params.user;
  db.query(`
    SELECT * from lessonNote WHERE userAccount = '${userAccount}';
  `, function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }            
  });
});

// 레슨 날짜 입력 하기
router.post('/dateinput', (req, res) => {
  const { userAccount, date, time } = req.body;
  db.query(`
  INSERT IGNORE INTO lessonNote (userAccount, date, time) VALUES
   ('${userAccount}', '${date}', '${time}');
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {            
    res.send(true);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});

// 레슨 날짜 삭제 하기
router.post('/datedelete', (req, res) => {
  const { userAccount, date } = req.body;
  db.query(`
  DELETE FROM lessonNote  WHERE userAccount = '${userAccount}' AND date = '${date}';
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {            
    res.send(true);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});

// 레슨 기록 입력 하기
router.post('/contentinput', (req, res) => {
  const { userAccount, date, content } = req.body;
  db.query(`
  UPDATE lessonNote SET note = '${content}' WHERE userAccount = '${userAccount}' AND date = '${date}';
  `,function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {            
    res.send(true);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});

// // 게시글 수정하기
// router.post('/posts/:postId/edit', (req, res) => {
//   var postId = parseInt(req.params.postId);
//   const { title, content } = req.body;
//   db.query(`
//   UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${postId}
//   `,function(error, result){
//   if (error) {throw error}
//   if (result.affectedRows > 0) {            
//     res.send(true);
//     res.end();
//   } else {
//     res.send(false);  
//     res.end();
//   }})
// });

// // 게시글 삭제하기
// router.post('/posts/:postId/delete', (req, res) => {
//   const { postId, userAccount } = req.body;
//   db.query(`DELETE FROM comments WHERE post_id = '${postId}';`);
//   db.query(`DELETE FROM isliked WHERE post_id = '${postId}';`);
//   db.query(`
//   DELETE FROM posts WHERE id = '${postId}' and userAccount = '${userAccount}';
//   `,function(error, result){
//   if (error) {throw error}
//   if (result.affectedRows > 0) {
//     res.send(true);
//     res.end();
//   } else {
//     res.send(false);  
//     res.end();
//   }})
// });

module.exports = router;