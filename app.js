var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var serveStatic = require('serve-static');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var mongoStore = require('connect');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var port = 3001;
var dbUrl = 'mongodb://localhost:27017/imooc';
var app = express();
var fs = require('fs');
mongoose.Promise = require('bluebird');
mongoose.connect(dbUrl);

// models loading
var models_path = __dirname + '/app/models';
var walk = function(path) {
  fs
    .readdirSync(path)
    .forEach(function(file) {
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath);
        }
      } else if (stat.isDirectory()) {
        walk(newPath);
      }
    })
}
walk(models_path);

app.set('views', './app/views/pages');
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('connect-multiparty')());
app.use(serveStatic('public'));
app.use(cookieParser());
app.use(cookieSession({
  secret: 'imooc',
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}));

if ('development' === app.get('env')) {
  app.set('showStackError', true);
  app.use(morgan(' :method :url :response-time'));
  app.locals.pretty = true;
  mongoose.set("debug", true);
}

app.locals.moment = require('moment');
app.listen(port);
console.log('Server is running at ' + port);

require('./config/routes')(app);
