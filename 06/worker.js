const { workerData, parentPort } = require('worker_threads');
const fs = require('fs');
const { Transform } = require('stream');

const [filePath, find] = workerData;
const readStream = new fs.ReadStream(filePath, 'utf8');

const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    const data = chunk.toString();
    if (find) {
      const [str, flags] = find.split(' ');
      const regEx = new RegExp(str, flags);
      const result = data.match(regEx);
      if (result) {
        const response = result.map((item) => `<li>${item}</li>`).join('');
        parentPort.postMessage(response);
      } else {
        parentPort.postMessage('Ничего не найдено');
      }
    } else {
      parentPort.postMessage(data);
    }
    callback();
  },
});

readStream.pipe(transformStream);
