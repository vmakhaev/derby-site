var derby = require('derby');
var markedOptions = require('../server/config/markedOptions');
var app = module.exports = derby.createApp('site', __filename);
var path = require('path');

global.app = app;

app.serverUse(module, 'derby-markdown', markedOptions);
app.serverUse(module, 'derby-stylus');
app.loadViews(path.join(__dirname, '/../../views/app'));
app.loadStyles(path.join(__dirname, '/../../styles/app'));
app.component(require('../../components/chat'));
app.component(require('../../components/sidebar'));

app.get('*', function (page, model, params, next) {
  if (model.get('_session.loggedIn')) {
    var userId = model.get('_session.userId');
    $user = model.at('users.' + userId);
    model.subscribe($user, function () {
      model.ref('_session.user', $user);
      next();
    });
  } else {
    next();
  }
});

app.get('/', function (page, model) {
  page.render('home');
});

app.get('/chat', function (page, model) {
  var $messagesQuery = model.query('messages', {});
  model.subscribe($messagesQuery, 'users', function () {
    page.render('chat');
  });
});

app.get('/:name/:sub?', function (page, model, params, next) {
  var name = params.name;
  var sub = params.sub;
  var viewName = sub ? name + ':' + sub : name;

  if (name === 'auth') return next();
  page.render(viewName);
});


app.on('model', function (model) {
  model.fn('all', function (doc) {
    return true;
  });
  model.fn('online', function (doc) {
    return doc.online;
  });
});