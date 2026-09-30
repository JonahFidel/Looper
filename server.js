var express = require('express');
var path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));

// Free historical sites set LOOPER_BUILD so / boots that saved script.
// The page is served at the site root so relative texture paths resolve there.
var buildPages = {
  mike: 'builds/mike.html',
  jonah: 'builds/jonah.html',
  merge: 'builds/merge.html'
};

var build = process.env.LOOPER_BUILD;
if (build) {
  if (!Object.prototype.hasOwnProperty.call(buildPages, build)) {
    throw new Error('Unknown LOOPER_BUILD: ' + build);
  }
  app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, buildPages[build]));
  });
}

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


