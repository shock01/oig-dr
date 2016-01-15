// static server
var connect = require('connect');
var http = require('http');
var static = require('serve-static');
var server = connect();

const testDir = __dirname + '/../test';
const libDir = __dirname + '/../lib';

server.use(static(__dirname + '/public'));
server.use('/node_modules', static(__dirname + '/../node_modules'));
server.use('/lib', static(libDir));
server.use('/test', static(testDir));

http.createServer(server).listen(3000, function() {
  console.log('server running on port 3000')
});

// livereload
var livereload = require('livereload');
livereloadServer = livereload.createServer();
livereloadServer.watch([testDir, libDir]);
console.log('livereload watching changes');
