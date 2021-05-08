#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

let currentDirectory = process.argv[2] || process.cwd();

const isFile = (fileName) => fs.lstatSync(path.join(currentDirectory, fileName)).isFile();

const isDirectory = (directoryName) =>
  fs.lstatSync(path.join(currentDirectory, directoryName)).isDirectory();

const list = (folder) =>
  new Promise((resolve) => {
    fs.readdir(currentDirectory, (err, data) => {
      resolve(data.filter(folder ? isDirectory : isFile));
    });
  });

(async () => {
  while (true) {
    console.log(currentDirectory);
    const folderList = await list('folder');
    const fileList = await list();
    const param = await inquirer.prompt([
      {
        name: 'type',
        type: 'list',
        message: 'Выберете действие:',
        choices: [
          'Посмотреть папки',
          'Посмотреть файлы',
          'Подняться на дирректорию вверх',
          'Закрыть приложение',
        ],
      },
    ]);
    try {
      if (param.type === 'Посмотреть файлы') {
        while (true) {
          const file = await inquirer.prompt([
            {
              name: 'fileName',
              type: 'list',
              message: 'Выберите файл:',
              choices: [
                ...(fileList.length ? fileList : ['Файлов не обнаружено, вернуться назад']),
                'Назад',
                'Закрыть приложение',
              ],
            },
          ]);
          if (file.fileName === 'Закрыть приложение') process.exit();
          else if (
            file.fileName === 'Назад' ||
            file.fileName === 'Файлов не обнаружено, вернуться назад'
          )
            break;
          const actionFile = await inquirer.prompt([
            {
              name: 'type',
              type: 'list',
              message: 'Выберете действие:',
              choices: ['Прочитать файл', 'Найти в файлe', 'Закрыть приложение'],
            },
          ]);
          const filePath = path.join(currentDirectory, file.fileName);
          if (actionFile.type === 'Прочитать файл') {
            for await (const chunk of fs.createReadStream(filePath)) {
              const data = chunk.toString();
              console.log(data);
            }
          } else if (actionFile.type === 'Найти в файлe') {
            const find = await inquirer.prompt([
              {
                name: 'type',
                type: 'input',
                message: 'Введите регулярное выражение для поиска в формате (127.0.0.1.*? g):',
              },
            ]);
            const [str, flags] = find.type.split(' ');
            const regEx = new RegExp(str, flags);
            for await (const chunk of fs.createReadStream(filePath)) {
              const data = chunk.toString();
              const result = data.match(regEx) || 'Ничего не найдено';
              console.log(result);
            }
          }
        }
      } else if (param.type === 'Посмотреть папки') {
        const folder = await inquirer.prompt([
          {
            name: 'name',
            type: 'list',
            message: 'Выберете действие:',
            choices: [
              ...(folderList.length ? folderList : ['Папок не обнаружено, вернуться назад']),
              'Назад',
              'Закрыть приложение',
            ],
          },
        ]);
        if (folder.name === 'Закрыть приложение') process.exit();
        else if (
          folder.name === 'Папок не обнаружено, вернуться назад' ||
          folder.name === 'Назад'
        ) {
          continue;
        } else {
          currentDirectory = path.join(currentDirectory, folder.name);
        }
      } else if (param.type === 'Подняться на дирректорию вверх') {
        const prevFolder = path.join(...currentDirectory.split(path.sep).slice(0, -1));
        currentDirectory = prevFolder;
      } else process.exit();
    } catch (error) {
      console.error('Ошибка чтения файла');
    }
  }
})();
