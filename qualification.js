const https = require('https');
const fs = require('fs');
const USERS_IN_ROUND = 24500;
var end = 0;
var global = this;
(function getQualificationScores() {
  var scores = [];
  var min_rank = 1;
  var num_consecutive_users = 100
  for (let min_rank = 1; min_rank < USERS_IN_ROUND; min_rank += 100) {
    setTimeout(() => {
      console.log(min_rank);
      var payload = { 
        "min_rank": min_rank,
        "num_consecutive_users": num_consecutive_users 
      }
      var encodedData = Buffer.from(JSON.stringify(payload)).toString('base64');
      const url = 'https://codejam.googleapis.com/scoreboard/00000000000000cb/poll?p=' + encodedData;
      https.get(url, res => {
        if (res.statusCode == 200) {
          var str = '';
          res.on('data', function (chunk) {
            str += chunk;
          });
          res.on('end', function () {
            var b64 = Buffer.from(str, 'base64').toString();
            const data = JSON.parse(b64);
            data['user_scores'].forEach(score => {
              scores.push({
                country: score.country,
                displayname: score.displayname,
                rank: score.rank,
                score_1: score.score_1,
                task_info: score.task_info
              });
            });
            
            end++;
            if (end === parseInt(USERS_IN_ROUND / 100)) {
              let resultString = 'const qualification = ';
              resultString = resultString + JSON.stringify(scores);
              resultString = resultString + ';';
              resultString = resultString + 'module.exports = qualification;';
              fs.writeFileSync('qualificationJSON.js', resultString);
              console.log("done");
            }
          });
        } else {
          console.log('Error Happened');
        }
      });
    }, 2000);
  }
})();