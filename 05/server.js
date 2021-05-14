const http = require('http');
const path = require('path');
const fs = require('fs');
const { URLSearchParams } = require('url');

const checkbox = (value) => `
  <li>
    <label for='${value}'>${value}</label>
    <input type="radio" name="option" id='${value}' value='${value}' >
  </li>`;

const back = `<input type="submit" name="option" id="back" value="Назад" >`;

let currentDirectory = process.argv[2] || process.cwd();

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
          ${listFolder.map((item) => checkbox(item)).join('') || '<h3>Папок не обнаружено</h3>'}
        </ul>
        <ul>
        <h2>Файлы</h2>
          ${listFile.map((item) => checkbox(item)).join('') || '<h3>Файлов не обнаружено</h3>'}
        </ul>
        </div>
        <button type="submit">Открыть</button>
        <input type="submit" name="option" id="back" value="Подняться по директории">
      </form>`;
  return str;
};

http
  .createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html;charset=utf-8');
    if (request.method === 'GET') {
      response.end(currentDirectoryStr() + basePage());
    } else if (request.method === 'POST') {
      let data = '';
      request.on('data', (chunk) => (data += chunk));
      request.on('end', async () => {
        const params = new URLSearchParams(data).get('option');
        if (params === 'Подняться по директории') {
          const prevFolder = path.join(...currentDirectory.split(path.sep).slice(0, -1));
          currentDirectory = prevFolder;
          response.end(currentDirectoryStr() + basePage());
        } else if (params === 'Назад') {
          response.end(currentDirectoryStr() + basePage());
        } else if (isFile(params)) {
          const filePath = path.join(currentDirectory, params);
          let data = '';
          response.write(currentDirectoryStr(params));
          for await (const chunk of fs.createReadStream(filePath)) {
            data = chunk.toString();
            response.write(data);
          }
          const str = ` 
              <form method='post'>
                ${back}
              </form>`;
          response.end(str);
        } else if (isDirectory(params)) {
          currentDirectory = path.join(currentDirectory, params);
          response.end(currentDirectoryStr() + basePage());
        }
      });
    } else {
      response.statusCode = 405;
      response.end();
    }
  })
  .listen(3000, () => console.log('Server listen port 3000'));
