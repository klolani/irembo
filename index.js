var http = require('http');
var server = http.createServer(function(request, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.end('Hello,world! This is Kenn, doing it for Irembo!');
});

server.listen(3000, function() {
  console.log('Server running on port 3000');
});
