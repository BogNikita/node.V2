const colors = require('colors/safe');
const EventEmitter = require('events');
const emitter = new EventEmitter();
const colorsTypes = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
];

const getTime = (ms) => {
  const hour = ms / (60 * 60 * 1000);
  const min = (hour % 1) * 60;
  const sec = (min % 1) * 60;
  return `${Math.floor(hour)}:${addZero(min)}:${addZero(sec)}`;
};

const addZero = (number) => (number < 10 ? '0' + Math.floor(number) : Math.floor(number));

let count = 0;
class Timer {
  constructor(color, end) {
    this.start = Date.now();
    this.end = this.dateToMs(end);
    this.color = color;
    ++count;
  }

  dateToMs(str) {
    const [hour, day, mounth, year] = str.split('-');
    const date = new Date(year, mounth - 1, day, hour);
    this.end = Date.parse(date);
    return this.end;
  }
}

const generateTimer = (time) => new Timer(colorsTypes[count], time);

const Handler = {
  start: (start, end, color) => {
    setInterval(() => {
      start += 1000;
      const time = end - start;
      console.log(colors[color](getTime(time)));
      if (start > end) {
        emitter.emit('stopTimer', start, end, color);
      }
    }, 1000);
  },
  end: (color) => {
    console.log(colors[color](`Таймер ${color} остановлен`));
  },
};

emitter.on('runTimer', Handler.start);
emitter.once('stopTimer', Handler.end);

const run = (...args) => {
  const timers = args.flat().map((arg) => generateTimer(arg));
  timers.forEach(({ start, end, color }) => {
    if (start > end) {
      emitter.emit('stopTimer', color);
    } else {
      emitter.emit('runTimer', start, end, color);
    }
  });
};

run(process.argv.slice(2));
