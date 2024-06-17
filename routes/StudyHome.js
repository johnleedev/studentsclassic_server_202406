const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');


// 아리아 ----------------------------------------------------------------------------------------

// 아리아 리스트 보내기
router.get('/getdataarias/:sort', async (req, res)=>{

  var sort = req.params.sort;
  db.query(`
     SELECT * FROM data${sort};
      `, function(error, result, fields) {
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

// 가사 번역 입력하기
router.post('/dataariastrans', async (req, res)=>{

  const { postId, lyrics, trans } = req.body;
  const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
  const lyricsCopy = escapeQuotes(lyrics);

  db.query(`
  UPDATE dataaria SET lyrics = '${lyricsCopy}', trans = '${trans}' WHERE id = '${postId}';
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


// 아리아 삭제하기
router.post('/dataariasdelete', (req, res) => {
  
  const { postId } = req.body;

  db.query(`
  DELETE FROM dataaria WHERE id = '${postId}';
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




// 오페라 & 시놉시스 & 대본 ----------------------------------------------------------------------------------------

// 리스트 보내기
router.get('/getdataoperas/:sort', async (req, res)=>{

  var sort = req.params.sort;

  db.query(`
     SELECT * FROM data${sort};
      `, function(error, result, fields) {
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


// 작곡가 ----------------------------------------------------------------------------------------

// 리스트 보내기
router.get('/getdatacomposer', async (req, res)=>{


  db.query(`
     SELECT * FROM datacomposer;
      `, function(error, result, fields) {
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


// 오페라 역할 ----------------------------------------------------------------------------------------

// 리스트 보내기
router.get('/getdataoperarole', async (req, res)=>{

  db.query(`
     SELECT * FROM dataoperarole;
      `, function(error, result, fields) {
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


module.exports = router;
