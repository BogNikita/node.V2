
const fs = require('fs');
const { Transform } = require('stream');

const readStream = new fs.ReadStream('./access.log', 'utf8');
const writeStream89 = fs.createWriteStream('./89.123.1.41._request.log', {
  flags: 'a',
  encoding: 'utf8',
});
const writeStream34 = fs.createWriteStream('./34.48.240.111._request.log', {
  flags: 'a',
  encoding: 'utf8',
});


const transformStream = new Transform({
  transform(chunk, encoding, callback) {
    chunk
      .toString()
      .match(/89.123.1.41.*\n?|34.48.240.111.*\n?/g)
      .forEach((item) => {
        if (/89.123.1.41.*\n?/g.test(item)) {
          writeStream89.write(item);
        } else {
          writeStream34.write(item);
        }
      });
    callback();
  },
});

readStream.pipe(transformStream);
readStream.on('end', () => console.log('end'))