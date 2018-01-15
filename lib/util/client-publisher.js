const faker = require('faker');
const request = require('request');

const topics = [
  'winners',
  'flyers',
  'digerido players',
];

const topicIds = [];

// create all the topics
topics.forEach((topic) => {
  request.post({
    url:'http://localhost:3000/topics',
    form: {
      name: topic
    }},
    (err,res,body) => {

    });
});

// save their ids
request.get('http://localhost:3000/topics', (err, res, body) => {
  JSON.parse(body).data.forEach((topic) => {
    topicIds.push(topic.id);
  });
});

console.log('');
console.log('publishing engaged. to observe, run this command: ');
console.log(' # npm run monitor');
console.log('');

// regularly publish to a random topic
const publish = () => {
  const messageBody = faker.name.findName();

  const idx = Math.floor(Math.random() * topicIds.length);
  const topicId = topicIds[idx];

  request.post({
    url: `http://localhost:3000/topics/${topicId}/sendMessage`,
    form: {
      messageBody
    }});

};

setInterval(publish, 200);
