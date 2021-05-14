const http = require('http');
const path = require('path');
const fs = require('fs');
const { URLSearchParams } = require('url');
const io = require('socket.io');
const { Worker } = require('worker_threads');

function start(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData });

    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

let currentDirectory = process.argv[2] || process.cwd();

const checkbox = (value, type) => `
  <li>
    <label for='${value}'>${value}</label>
    <input type="radio" name=${type} id='${value}' value='${value}' >
  </li>`;

const back = `
  <form method='post'>
    <input type="submit" name="option" id="back" value="Назад" >
  </form>
`;

let currentDirectoryStr = (file = '') =>
  `<h1>Текущая дирректория: ${currentDirectory} ${file ? `Файл: ${file}` : ''}</h1>`;

const isFile = (fileName) => fs.lstatSync(path.join(currentDirectory, fileName)).isFile();

const isDirectory = (directoryName) =>
  fs.lstatSync(path.join(currentDirectory, directoryName)).isDirectory();

const list = (folder) => fs.readdirSync(currentDirectory).filter(folder ? isDirectory : isFile);

const basePage = () => {
  const listFile = list();
  const listFolder = list(true);
  const str = `
      <form method='post' style="width: 900px; margin: 0 auto">
      <div style="display: flex; justify-content: space-between;">
        <ul>
        <h2>Папки</h2>
          ${
            listFolder.map((item) => checkbox(item, 'folder')).join('') ||
            '<h3>Папок не обнаружено</h3>'
          }
        </ul>
        <ul>
        <h2>Файлы</h2>
          ${
            listFile.map((item) => checkbox(item, 'file')).join('') ||
            '<h3>Файлов не обнаружено</h3>'
          }
        </ul>
        </div>
        <ul>
          <li><button type="submit">Открыть</button></li>
          <li><label label for='reg'>Введите регулярное выражение для поиска</label><br>
          <input type="text" name="reg" id="reg" placeholder="127.0.0.1.*? g"></li>
          <li><input type="submit" name="action" id="search" value="Найти" ></li>
          <li><input type="submit" name="option" id="back" value="Подняться по директории"></li>
        </ul>
      </form>`;
  return str;
};

const htmlPath = path.join(__dirname, 'reader.html');
const html = fs.readFileSync(htmlPath).toString();

const app = http.createServer((request, response) => {
  response.setHeader('Content-Type', 'text/html;charset=utf-8');
  if (request.method === 'GET') {
    response.end(currentDirectoryStr() + basePage() + html);
  } else if (request.method === 'POST') {
    let data = '';
    request.on('data', (chunk) => (data += chunk));
    request.on('end', async () => {
      const params = new URLSearchParams(data).get('option');
      const regExp = new URLSearchParams(data).get('reg');
      const action = new URLSearchParams(data).get('action');
      const file = new URLSearchParams(data).get('file');
      const folder = new URLSearchParams(data).get('folder');
      if (params === 'Подняться по директории') {
        const prevFolder = path.join(...currentDirectory.split(path.sep).slice(0, -1));
        currentDirectory = prevFolder;
        response.end(currentDirectoryStr() + basePage() + html);
      } else if (params === 'Назад') {
        response.end(currentDirectoryStr() + basePage() + html);
      } else if (action === 'Найти' && file) {
        const filePath = path.join(currentDirectory, file);
        response.write(currentDirectoryStr(params) + html);
        start([filePath, regExp])
          .then((result) => response.write(result))
          .then(() => response.end(back))
          .catch((err) => console.error(err));
      } else if (action === 'Найти' && !file) {
        response.end(currentDirectoryStr() + basePage() + html + '<h1>Выберите файл</h1>');
      } else if (file) {
        const filePath = path.join(currentDirectory, file);
        response.write(currentDirectoryStr(file) + html);
        start([filePath])
          .then((result) => response.write(result))
          .then(() => response.end(back))
          .catch((err) => console.error(err));
      } else if (folder) {
        currentDirectory = path.join(currentDirectory, folder);
        response.end(currentDirectoryStr() + basePage() + html);
      } else if (!folder && !file) {
        response.end(
          currentDirectoryStr() + basePage() + html + '<h1>Выберите файл или папку</h1>',
        );
      }
    });
  } else {
    response.statusCode = 405;
    response.end();
  }
});

const socket = io(app);

let currentConnect = 0;

socket.on('connection', function (client) {
  console.log('New connection');
  currentConnect++;

  client.emit('USERS_ONLINE', { msg: currentConnect });
  client.broadcast.emit('NEW_CONN_EVENT', { currentConnect });

  client.on('disconnect', () => {
    console.log('User Disconect');
    currentConnect--;
    client.broadcast.emit('USERS_ONLINE', { msg: currentConnect });
  });
});

app.listen(3000, () => console.log('Server listen port 3000'));
