const express = require('express');
const router = express.Router()
var cors = require('cors');
router.use(cors());
router.use(express.json()); // axios 전송 사용하려면 이거 있어야 함
const { db } = require('../db');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

process.setMaxListeners(200);

router.post('/postmeaning', async (req, res) => {
  const { nation, word, wordNum } = req.body;
  const nationquery = (nation === 'Itary') ? 'itkodict' : 'dekodict';

  try {
      // Puppeteer 브라우저 및 페이지 생성
      const browser = await puppeteer.launch({
          headless: "new",
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // 네트워크 조건 설정
      await page.emulateNetworkConditions(puppeteer.networkConditions.Fast3G);

      // 네이버 사전 페이지로 이동
      await page.goto(`https://dict.naver.com/${nationquery}/#/search?range=word&query=${word}`, { waitUntil: 'networkidle2' });

      // 페이지 로드 확인 및 Cheerio로 파싱
      await page.waitForTimeout(3000);
      const content = await page.content();
      const $ = cheerio.load(content);
      let resultArray = [];
      let hrefLink = '';

      // 검색 결과에서 상위 5개 항목을 처리
      $('.component_keyword .row').slice(0, 5).each((index, element) => {
          const source = (nation === 'Itary') ? $(element).find('p:contains("한국외국어대학교")') : $(element).find('p:contains("민중서림")');
          const parentElement = source.parent();
          if (parentElement.length > 0) {
              const result = $(parentElement).find('.origin a.link').attr('href');
              resultArray.push(result);
          }
      });

      hrefLink = resultArray[0];
      
      if (!hrefLink) {
          throw new Error('검색 결과를 찾을 수 없습니다.');
      }

      // 의미 페이지로 이동
      await page.goto(`https://dict.naver.com/${nationquery}/${hrefLink}`, { waitUntil: 'networkidle2' });

      // 페이지 로드 확인 및 Cheerio로 파싱
      await page.waitForTimeout(3000);
      const subcontent = await page.content();
      const sub$ = cheerio.load(subcontent);

      // 의미 파싱
      const formattedWord = [];
      sub$('.mean_list > .mean_item.my_mean_item').each((index, element) => {
          const additionalMeanings = sub$(element).find('.mean_list > .mean_item.my_mean_item');
          if (additionalMeanings.length > 0) {
              const num = sub$(element).find('> div.mean_desc > span.num').text().trim();
              const gender = sub$(element).find('> div.mean_desc > div.cont > em.part_speech').text().trim();
              const meaning = sub$(element).find('> div.mean_desc > div.cont > span.mean').text().trim();
              const relationWord = sub$(element).find('ul.component_relation');

              const formattedEntry = {
                  num: num,
                  gender: gender,
                  meaning: meaning,
              };

              const addMeaning = [];
              additionalMeanings.each((addIndex, addElement) => {
                  const addNum = sub$(addElement).find('div.mean_desc span.num.c').text().trim();
                  const addGender = sub$(addElement).find('div.mean_desc div.cont em.part_speech').text().trim();
                  const addMeaningText = sub$(addElement).find('div.mean_desc div.cont span.mean').text().trim();
                  addMeaning.push({
                      addNum: addNum,
                      addGender: addGender,
                      addMeaning: addMeaningText,
                  });
              });

              formattedEntry.addMeaning = addMeaning;

              if (relationWord.length > 0) {
                  const relationWordCopy = sub$(element).find('ul.component_relation li.row span.item').text().trim();
                  formattedEntry.relationWord = relationWordCopy;
              }

              formattedWord.push(formattedEntry);
          } else {
              const copy = sub$(element).find('> div.mean_desc span.num.c');
              if (copy.length > 0) {
                  return;
              } else {
                  const num = sub$(element).find('> div.mean_desc > span.num').text().trim();
                  const gender = sub$(element).find('> div.mean_desc > div.cont > em.part_speech').text().trim();
                  const meaning = sub$(element).find('> div.mean_desc > div.cont > span.mean').text().trim();
                  const relationWord = sub$(element).find('ul.component_relation');

                  const formattedEntry = {
                      num: num,
                      gender: gender,
                      meaning: meaning,
                  };

                  if (relationWord.length > 0) {
                      const relationWordCopy = sub$(element).find('ul.component_relation li.row span.item').text().trim();
                      formattedEntry.relationWord = relationWordCopy;
                  }

                  formattedWord.push(formattedEntry);
              }
          }
      });

      await browser.close();

      const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
      const wordCopy = escapeQuotes(word);
      const formattedWordCopy = JSON.stringify(formattedWord);
      const formattedWordCopy2 = escapeQuotes(formattedWordCopy);

      db.query(`SELECT word FROM dataword${nation} WHERE word = '${wordCopy}';`, function (error, result) {
          if (error) {
              throw error;
          }
          if (result.length === 0) {
              db.query(`INSERT IGNORE INTO dataword${nation} (word, meaning) VALUES ('${wordCopy}', '${formattedWordCopy2}');`, function (error, result) {
                  if (error) {
                      throw error;
                  }
                  if (result.affectedRows > 0) {
                      console.log(wordNum, '입력되었습니다.');
                      res.send(true);
                      res.end();
                  } else {
                      console.log(wordNum, '입력되지 않았습니다.');
                      res.send(false);
                      res.end();
                  }
              });
          } else {
              console.log(wordNum, '이미 저장된 단어입니다.');
              res.send(false);
              res.end();
          }
      });
  } catch (err) {
      console.error('Error:', err.message);
      res.status(500).send('서버 오류가 발생했습니다.');
  }
});

router.get('/getwordall222/:nation', async (req, res)=> {
  const nation = req.params.nation;
  const nationCopy = nation === 'Itary' ? 'itary' : 'german'
  db.query(`
  select * from dataword${nationCopy};
  `, function(error, result){
  if (error) {throw error}
  if (result.length > 0) {
    res.send(result);
    res.end();
  } else {
    res.send(error);  
    res.end();
  }})

 })


 router.post('/insertword', async (req, res) => {
  const { word, wordNum } = req.body;
  try {
    // 데이터베이스에 단어 삽입
    db.query(`
      INSERT IGNORE INTO datawordgerman_pre_array (word) VALUES ('${word}');
    `, function (error, result) {
      if (error) {
        // 오류 발생 시 예외 처리
        console.error('Database Error:', error.message);
        res.status(500).send('데이터베이스 오류가 발생했습니다.');
        return;
      }
      if (result.affectedRows > 0) {
        // 삽입 성공 시
        console.log(wordNum, '입력되었습니다.');
        res.status(200).send('입력되었습니다.');
      } else {
        // 이미 존재하는 경우
        console.log(wordNum, '입력되지 않았습니다.');
        res.status(200).send('입력되지 않았습니다.');
      }
    });
  } catch (err) {
    // 기타 오류 발생 시 예외 처리
    console.error('Error:', err.message);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});


module.exports = router;
