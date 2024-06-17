const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');



const fs = require('fs');

// JSON 파일 읽기
const test = () => {
  fs.readFile('./synopsis_info_preprocessed.json', 'utf8', (err, data) => {
    if (err) {
      console.error('파일을 읽을 수 없습니다.', err);
      return;
    }

    try {
      // JSON 파싱
      const operaData = JSON.parse(data);
      
      console.log(operaData.length);
      
      // operaData.map((item, index) => { 
      //   const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
      //   const opera_titleCopy = item.opera_title === null ? '' : escapeQuotes(item.opera_title);
      //   const composerCopy = item.composer === null ? '' : escapeQuotes(item.composer);
      //   const synopsisCopy = item.synopsis === null ? '' : escapeQuotes(item.synopsis);

      //   try {
      //     db.query(`
      //     INSERT IGNORE INTO datasynopsis (opera_title, composer, synopsis) VALUES 
      //     ('${opera_titleCopy}', '${composerCopy}', '${synopsisCopy}');
      //     `, function(error, result){
      //       if (error) {
      //         console.error(`Error at index ${index}:`, error);
      //         return;
      //       }
      //       if (result.affectedRows > 0) {  
      //         console.log(index, '입력되었습니다.');
      //       } else {
      //         console.log(index, '입력되지 않았습니다.');
      //       }
      //     });
      //   } catch (queryError) {
      //     console.error(`Query error at index ${index}:`, queryError);
      //   }
      // })
     
    } catch (err) {
      console.error('JSON 파싱 에러:', err);
    }
  });
}


// const test22 = () => {
//   db.query(`
//   select * from datalibretto;
//   `, function(error, result){
//   if (error) {throw error}
//   if (result.length > 0) {
    
//     console.log(result)
//   } else {
    
//   }})
// }



test();

module.exports = router;
