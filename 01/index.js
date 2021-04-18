const colors = require('colors/safe');
const arrayColors = ['green', 'yellow', 'red'];

function isNatural(num) {
  const check = [];
  if (num > 3 && num !== 5) {
    for (let i = 2; i <= 5; i++) {
      if (i === 4) {
        continue;
      }
      const result = num % i;
      check.push(result);
    }
  }
  const test = check.every((item) => item !== 0);
  return test;
}

function start(start, end) {
  if (Number(start) && Number(end)) {
    let trafficLight = 0;
    let flag = false;
    for (let i = start; i <= end; i++) {
      if (isNatural(i)) {
        flag = true;
        console.log(colors[arrayColors[trafficLight]](i));
        trafficLight++;
      }
      if (trafficLight === 3) {
        trafficLight = 0;
      }
    }
    if (!flag) {
      console.log(colors.red('В диапозоне нет натуральных чисел'));
    }
  } else {
      console.log('error');
  }
}

start(1, false);
