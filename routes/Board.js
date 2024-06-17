const express = require('express');
const router = express.Router()
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

// 게시글 전체 목록 조회 API
router.get('/posts/get', (req, res) => {
  db.query(`
    SELECT p.*, COUNT(c.id) AS commentCount
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id
  `, function(error, result, fields) {
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

// 게시글 조회시, 조회수 증가시키기
router.post('/posts/:postId/views', (req, res) => {
  var postId = parseInt(req.params.postId);
  db.query(`
  UPDATE posts SET views = views + 1 WHERE id = ${postId}
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

// 게시글 생성하기
router.post('/posts', (req, res) => {
  const { sort, title, content, userAccount, userName, userSchool, userSchNum, userPart, date } = req.body;
  db.query(`
  INSERT IGNORE INTO posts (sort, title, content, userAccount, userName, userSchool, userSchNum, userPart, date) VALUES
   ('${sort}', '${title}', '${content}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', '${date}');
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

// 게시글 수정하기
router.post('/posts/:postId/edit', (req, res) => {
  var postId = parseInt(req.params.postId);
  const { title, content } = req.body;
  db.query(`
  UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${postId}
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

// 게시글 삭제하기
router.post('/posts/:postId/delete', (req, res) => {
  const { postId, userAccount } = req.body;
  db.query(`DELETE FROM comments WHERE post_id = '${postId}';`);
  db.query(`DELETE FROM isliked WHERE post_id = '${postId}';`);
  db.query(`
  DELETE FROM posts WHERE id = '${postId}' and userAccount = '${userAccount}';
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

// GET /board/comments/:postId - 특정 게시물의 댓글 목록 가져오기
router.get('/comments/:postId', (req, res) => {
  var postId = parseInt(req.params.postId);
  db.query(`
  select * from comments where post_id = '${postId}'
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.send(result);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});

// 댓글 입력하기
router.post('/comments', (req, res) => {
  const { postId, commentText, date, userAccount, userName, userSchool, userSchNum, userPart } = req.body;
  db.query(`
  INSERT IGNORE INTO comments (post_id, content, userAccount, userName, userSchool, userSchNum, userPart, date) VALUES 
   ('${postId}', '${commentText}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', '${date}');
  `, function(error, result){
  if (error) {throw error}
  if (result.affectedRows > 0) {
    res.send(true);
    res.end();
  } else {
    res.send(false);  
    res.end();
  }})
});


// 댓글 삭제하기
router.post('/comments/delete', (req, res) => {
  const { ID, post_id, userAccount } = req.body;
  db.query(`
  DELETE FROM comments WHERE id = '${ID}' and post_id = '${post_id}' and userAccount = '${userAccount}';
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





// 좋아요 게시글 데이터 가져오기
router.get('/posts/:postID/:userAccount', (req, res) => {
  const postId = req.params.postID;
  const userAccount = req.params.userAccount;
  db.query(`
    SELECT * FROM isliked WHERE post_id = '${postId}' and userAccount = '${userAccount}';
  `, function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(true);
      res.end();
    } else {              
      res.send(false);
      res.end();
    }            
  });
});



// 게시글 좋아요 버튼, 토글 관리
router.post('/posts/:postID/isliked', (req, res) => {
  const { isLiked, postId, userAccount } = req.body;
  if (isLiked === false) {
    db.query(`
    UPDATE posts SET isLiked = isLiked + 1 WHERE id = ${postId};
    `,function(error, result){
    if (error) {throw error}
    if (result.affectedRows > 0) {
      db.query(`
      INSERT IGNORE INTO isliked (post_id, isliked, userAccount) VALUES 
          ('${postId}', 'true', '${userAccount}');
      `,function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {
        res.send(true); res.end();
      } else {
        res.send(false); res.end();
      }})
    } else {
      res.send(false); res.end();
    }})
  } else if (isLiked === true) {
    db.query(`
    UPDATE posts SET isLiked = isLiked - 1 WHERE id = ${postId};
    `,function(error, result){
    if (error) {throw error}
    if (result.affectedRows > 0) {
      db.query(`
      DELETE FROM isliked WHERE post_id = ${postId} and userAccount = '${userAccount}';
      `,function(error, result){
      if (error) {throw error}
      if (result.affectedRows > 0) {
        res.send(false);
        res.end();
      } else {
        res.send(false);
        res.end();
      }})
    } else {
      res.send(false);
      res.end();
    }})
  }
  
});




module.exports = router;