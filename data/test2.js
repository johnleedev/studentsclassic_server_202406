
// JSON 파일 읽기
const test = () => {
  fs.readFile('./duet_info_preprocessed.json', 'utf8', (err, data) => {
    if (err) {
      console.error('파일을 읽을 수 없습니다.', err);
      return;
    }

    try {
      // JSON 파싱
      const operaData = JSON.parse(data);
      
      // console.log(operaData.length);
      
      operaData.map((item, index) => { 
        const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll("'", "\\\'").replaceAll('"', '\\\"').replaceAll('\\n', '\\\\n');
        const duet_titleCopy = item.duet_title === null ? '' : escapeQuotes(item.duet_title);
        const opera_titleCopy = item.opera_title === null ? '' : escapeQuotes(item.opera_title);
        const composerCopy = item.composer === null ? '' : escapeQuotes(item.composer);
        const typeCopy = item.type === null ? '' : escapeQuotes(item.type);
        const roleCopy = item.role === null ? '' : escapeQuotes(item.role);
        const voiceCopy = item.voice === null ? '' : escapeQuotes(item.voice);
        const actCopy = item.act === null ? '' : escapeQuotes(item.act);
        const languageCopy = item.language === null ? '' : escapeQuotes(item.language);
        const lyricsCopy = item.lyrics === null ? '' : escapeQuotes(item.lyrics);

        try {
          db.query(`
          INSERT IGNORE INTO dataduet (duet_title, opera_title, composer, language, role, voice, act, type, lyrics) VALUES 
          ('${duet_titleCopy}', '${opera_titleCopy}', '${composerCopy}', '${languageCopy}', '${roleCopy}', '${voiceCopy}', '${actCopy}', '${typeCopy}', '${lyricsCopy}');
          `, function(error, result){
            if (error) {
              console.error(`Error at index ${index}:`, error);
              return;
            }
            if (result.affectedRows > 0) {  
              console.log(index, '입력되었습니다.');
            } else {
              console.log(index, '입력되지 않았습니다.');
            }
          });
        } catch (queryError) {
          console.error(`Query error at index ${index}:`, queryError);
        }
      })
     
    } catch (err) {
      console.error('JSON 파싱 에러:', err);
    }
  });
}


const test2 = () => {
  fs.readFile('./composer_info_preprocessed.json', 'utf8', (err, data) => {
    if (err) {
      console.error('파일을 읽을 수 없습니다.', err);
      return;
    }

    try {
      // JSON 파싱
      const fsData = JSON.parse(data);
      
      fsData.map((item, index) => { 

        const escapeQuotes = (str) => str.replaceAll('è', '\è').replaceAll('é', '\é').replaceAll("'", "\'\'").replaceAll('"', '\"').replaceAll('\\n', '\n');
        const composerCopy = item.composer === null ? '' : escapeQuotes(item.composer);
        const country_of_birthCopy = item.country_of_birth === null ? '' : escapeQuotes(item.country_of_birth);
        const year_of_birthCopy = item.year_of_birth === null ? '' : escapeQuotes(item.year_of_birth);
        const death_of_birthCopy = item.death_of_birth === null ? '' : escapeQuotes(item.death_of_birth);
        const summaryCopy = item.summary === null ? '' : escapeQuotes(item.summary);
        const operaListMap =  item.opera_list === null ? '' : escapeQuotes(item.opera_list);
        const operaList = operaListMap.split('\n').map(item => item.trim());
        const opera_listCopy = operaList === '' ? '' : JSON.stringify(operaList);

        try {
          db.query(`
          INSERT IGNORE INTO datacomposer (composer, country_of_birth, year_of_birth, death_of_birth, summary, opera_list) VALUES 
          ('${composerCopy}', '${country_of_birthCopy}', '${year_of_birthCopy}', '${death_of_birthCopy}', '${summaryCopy}', '${opera_listCopy}');
          `, function(error, result){
            if (error) {
              console.error(`Error at index ${index}:`, error);
              return;
            }
            if (result.affectedRows > 0) {  
              console.log(index, '입력되었습니다.');
            } else {
              console.log(index, '입력되지 않았습니다.');
            }
          });
        } catch (queryError) {
          console.error(`Query error at index ${index}:`, queryError);
        }
      })
     
    } catch (err) {
      console.error('JSON 파싱 에러:', err);
    }
  });
}