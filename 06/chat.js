const http = require('http');
const io = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = http.createServer((request, response) => {
  if (request.method === 'GET') {
    const filePath = path.join(__dirname, 'index.html');

    readStream = fs.createReadStream(filePath);

    readStream.pipe(response);
  } else if (request.method === 'POST') {
    let data = '';

    request.on('data', (chunk) => {
      data += chunk;
    });

    request.on('end', () => {
      const parsedData = JSON.parse(data);
      console.log(parsedData);

      response.writeHead(200, { 'Content-Type': 'json' });
      response.end(data);
    });
  } else {
    response.statusCode = 405;
    response.end();
  }
});

const socket = io(app);

const users = [];
let currentConnect = 0;

socket.on('connection', function (client) {
  console.log('New connection');
  currentConnect++;
  const newUser = `User ${users.length + 1}`;
  users.push(newUser);

  client.emit('USER_NAME', { userName: newUser });
  client.emit('USERS_ONLINE', { msg: currentConnect });
  client.broadcast.emit('NEW_CONN_EVENT', {
    msg: `${newUser} connected...`,
    newUser,
    currentConnect,
  });

  client.on('CLIENT_MSG', (data) => {
    client.emit('SERVER_MSG_SELF', { msg: `Server: ${data.msg.split('').reverse().join('')}` });
    client.broadcast.emit('SERVER_MSG', {
      msg: `Server: ${data.msg.split('').reverse().join('')}`,
    });
    client.broadcast.emit('USER_MSG', { msg: `${newUser}: ${data.msg}` });
  });

  client.on('disconnect', (data) => {
    console.log(data);
    console.log('User Disconect');
    client.broadcast.emit('USER_DISC_EVENT', { msg: 'User disconect' });
    currentConnect--;
    client.broadcast.emit('USERS_ONLINE', { msg: currentConnect });
  });
});

app.listen(3000, () => console.log('Server listen port 3000'));
