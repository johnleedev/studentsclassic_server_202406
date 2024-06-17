const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');

// 앱실행시, 접속 수 증가시키기
router.post('/videocount', (req, res) => {
  const { date } = req.body;
  db.query(`
  UPDATE appusecount SET videocount = videocount + 1 WHERE date = '${date}';
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


// 졸연영상 게시글 가져오기
router.get('/getgraduate/:account/:page', async (req, res)=>{
  const userAccount = req.params.account;
  const page = parseInt(req.params.page); // 현재 페이지 번호
  let perPage;
  perPage = 6 + ((page - 2) * 3);

  db.query(`
    SELECT * FROM videos;
  `, function(error, result) {
    if (error) throw error;
 
    const totalRow = result.length;
    const schools = [...new Set(result.map((item)=> item.school))];

    db.query(`
      SELECT vg.*, IF(vgil.id IS NOT NULL, true, false) AS userIsliked
      FROM videos vg
      LEFT JOIN videosIsLiked vgil ON vg.id = vgil.videosPostId AND vgil.userAccount = '${userAccount}'
      ORDER BY vg.id DESC
      LIMIT 0, ${perPage};
    `
    , function(error, result2) {
      if (error) throw error;
      if (result2.length > 0) {

        const resultData = {
          isData : true,
          schools : schools,
          resultRow: result2,
          totalRowNum: totalRow
        };
        res.send(resultData);
        res.end();
      } else {             
        res.send(false);
        res.end();
      }
    })

  })
  
});

// 졸연영상 게시글 선택영상 가져오기
router.get('/getgraduatesearch/:account/:school/:page', async (req, res)=>{
  const userAccount = req.params.account;
  const userSchool = req.params.school;
  const page = parseInt(req.params.page); // 현재 페이지 번호

  let perPage;
  perPage = 6 + ((page - 2) * 3);

  db.query(`
  SELECT COUNT(*) AS totalCount FROM videos WHERE school = '${userSchool}';
  `, function(error, result) {
    if (error) throw error;

    const totalRow = result[0].totalCount

    db.query(`
      SELECT vg.*, IF(vgil.id IS NOT NULL, true, false) AS userIsliked
      FROM videos vg
      LEFT JOIN videosIsLiked vgil ON vg.id = vgil.videosPostId AND vgil.userAccount = '${userAccount}'
      WHERE vg.school = '${userSchool}'
      ORDER BY vg.id DESC
      LIMIT 0, ${perPage};
    `
    , function(error, result2) {
      if (error) throw error;
      if (result2.length > 0) {
        const resultData = {
          isData : true,
          resultRow: result2,
          totalRowNum: totalRow
        };
        res.send(resultData);
        res.end();
      } else {             
        res.send(false);
        res.end();
      }
    })
  
  })
  
});

// 졸연영상 게시글 가져오기
router.get('/getgraduatesearch/:account/:', async (req, res)=>{
  const userAccount = req.params.account;
  const page = parseInt(req.params.page); // 현재 페이지 번호

  let perPage;
  perPage = 6 + ((page - 2) * 3);

  db.query(`
    SELECT vg.*, IF(vgil.id IS NOT NULL, true, false) AS userIsliked
    FROM videos vg
    LEFT JOIN videosIsLiked vgil ON vg.id = vgil.videosPostId AND vgil.userAccount = '${userAccount}'
    ORDER BY vg.id DESC
    LIMIT 0, ${perPage};
  `
  , function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })
});

// 졸연영상 좋아요 리스트 가져오기
router.get('/getgraduateislikedlist/:postid', async (req, res)=>{
  const postId = req.params.postid;
  db.query(`
    select * from videosIsLiked WHERE videosPostId = '${postId}';
  `, function(error, result) {
    if (error) throw error;
    if (result.length > 0) {
      res.send(result);
      res.end();
    } else {             
      res.send(false);
      res.end();
    }
  })
});


// 졸연영상 좋아요 버튼, 토글 관리
router.post('/postgraduateisliked', async (req, res) => {
  const { postId, userAccount, userName, userSchool, userSchNum, userPart, date } = req.body;
 
  db.query(`
    select * from videosIsLiked WHERE videosPostId = '${postId}' AND userAccount = '${userAccount}';
    `, async function(error, result){
    if (error) {throw error}
    if (result.length > 0) {
      await db.query(`UPDATE videos SET isLiked = isLiked - 1 WHERE id = ${postId};`);
      db.query(`
        DELETE FROM videosIsLiked WHERE videosPostId = '${postId}' AND userAccount = '${userAccount}';
        `,function(error, result){
        if (error) {throw error}
        if (result.affectedRows > 0) {
          res.send(true);
          res.end();
        } else {
          res.send(false);  
          res.end();
      }})
    } else {
      await db.query(`UPDATE videos SET isLiked = isLiked + 1 WHERE id = ${postId};`);
      db.query(`
        INSERT IGNORE INTO videosIsLiked (videosPostId, userAccount, userName, userSchool, userSchNum, userPart, date) VALUES
        ('${postId}', '${userAccount}', '${userName}', '${userSchool}', '${userSchNum}', '${userPart}', '${date}');
        `,function(error, result){
        if (error) {throw error}
        if (result.affectedRows > 0) {
          res.send(true);
          res.end();
        } else {
          res.send(false); 
          res.end();
     }})
  }})
});


// 게시글 생성하기
router.post('/postvideo', (req, res) => {
  const { userAccount, sort, url, year, school, name, part, date } = req.body;
  db.query(`
  INSERT IGNORE INTO videos (userAccount, sort, url, year, school, name, part, date) VALUES
   ('${userAccount}', '${sort}', '${url}', '${year}', '${school}', '${name}', '${part}', '${date}');
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


module.exports = router;
