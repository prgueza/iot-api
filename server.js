const http = require('http');
const sockets = require('socket.io');
const app = require('./app');

const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = sockets.listen(server);
require('./api/controllers/update').manager(io);


server.listen(port);
