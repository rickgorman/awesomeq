const request = require('request');
const prettyjson = require('prettyjson');

const monitor = () => {
  setInterval(() => {
    request('http://localhost:3000/monitor', (err, res, body) => {
      // this clears the console
      process.stdout.write("\u001b[2J\u001b[0;0H");

      console.log('o----------------o');
      console.log('| Active topics: |');
      console.log('o----------------o');
      try {
        console.log(prettyjson.render(JSON.parse(body)));
      }
      catch (err) {

      }
    });
  }, 350);
};

monitor();
