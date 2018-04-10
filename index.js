const restify = require('restify');
const qualificationData = require('./qualificationJSON');

const corsHeaders = function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
  next();
};
qualificationData.sort((a,b) => {
  return a.rank - b.rank;
});
const server = restify.createServer();
server.use(restify.plugins.bodyParser({maxBodySize: 104857600}));
server.use(corsHeaders);
server.use(restify.plugins.queryParser());

server.use(function(req, res, next) {
  req.connection.setTimeout(3600 * 1000);
  res.connection.setTimeout(3600 * 1000);
  next();
});


const countries = Array.from(new Set(qualificationData.map(d => {
  return d.country;
})));
const users = qualificationData.map(d => {
  return d.displayname;
});

getCountries = function(req, res, next) {
  res.send(countries);
}
getSimiliarUser = function(req, res, next) {
  const user = req.query.user.split(' ').join('').toLowerCase();
  console.log(user);
  let ans = qualificationData.filter((d, index) => {
    return d.displayname.split(' ').join('').toLowerCase().includes(user);
  });
  ans.sort((a, b) => {
    return +a.rank - +b.rank;
  }); 
  res.send(ans);
}
getByCountry = function(req, res, next) {
  let country = req.params.name;
  if (country) {
    country = country.split(' ').join('').toLowerCase()
  }
  let ans = qualificationData.filter((d, index) => {
    return d.country.split(' ').join('').toLowerCase().includes(country);
  });
  ans = ans.sort((a, b) => {
    return +a.rank - +b.rank;
  });
  res.send(ans);
}
getPage = function(req, res, next) {
  let page = req.query.page;
  console.log('page ', page);
  if (!page) {
    page = 0;
  }
  page++;
  page *= 30;
  res.send(qualificationData.slice(page - 30, page));
}
friendList = function(req, res, next) {
  const friends = req.body.friends;
  console.log(friends);
  const ans = qualificationData.filter(d => {
    return friends.includes(d.displayname);
  });
  res.send(ans);
}
server.get('/countries', getCountries);
server.get('/similar-users', getSimiliarUser);
server.get('/country/:name', getByCountry);
server.get('/', getPage);
server.post('/friends', friendList);
server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
