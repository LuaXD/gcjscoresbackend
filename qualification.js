const https = require('https');
const base64 = require('base-64');
const fs = require('fs');
const USERS_IN_ROUND = 24000;
var end = 0;

(function getQualificationScores() {
  var scores = [];
  var min_rank = 1;
  var num_consecutive_users = 100
  while(min_rank < USERS_IN_ROUND) {
    min_rank += 100;
    setTimeout(() => {
      var payload = { 
        "min_rank": min_rank,
        "num_consecutive_users": num_consecutive_users 
      }
      var encodedData = base64.encode(JSON.stringify(payload));
      const url = 'https://codejam.googleapis.com/scoreboard/00000000000000cb/poll?p=' + encodedData;
      https.get(url, res => {
        var str = '';
        if (res.statusCode == 200) {
          res.on('data', function (chunk) {
            str += chunk;
          });
          res.on('end', function () {
            const data = JSON.parse(base64.decode(str));
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
              console.log('my end ', scores);
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