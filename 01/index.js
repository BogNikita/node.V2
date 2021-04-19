const colors = require('colors/safe');
const arrayColors = ['green', 'yellow', 'red'];

function isPrime(num) {
  if (num > 1) {
    for (let i = 2, max = num ** 0.5; i <= max; i++) {
      if (!(num % i)) {
        return false;
      }
    }
  }
  return num > 1;
}

function getPrimesInterval(a, b) {
  let start = Number(a);
  let end = Number(b);

  if (start && end) {
    if (start > end) {
      start = start + end;
      end = start - end;
      start = start - end;
    }

    let trafficLight = 0;
    let flag = false;

    for (let i = start; i <= end; i++) {
      if (isPrime(i)) {
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
    return;
  } else {
    console.error('Вы ввели не число');
    return;
  }
}

getPrimesInterval(process.argv[2], process.argv[3]);
