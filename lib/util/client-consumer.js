const request = require('request');

// get the current topics
const topicIds = [];
request.get('http://localhost:3000/topics', (err, res, body) => {
  JSON.parse(body).data.forEach((topic) => {
    topicIds.push(topic.id);
  });
});

const consume = () => {
  // choose a queue to consume
  const idx = Math.floor(Math.random() * topicIds.length);
  const topicId = topicIds[idx];

  // get a message from the queue
  let messageId;
  request(
    `http://localhost:3000/topics/${topicId}/receiveMessage`,
    (err, res, body) => {
      try {
        messageId = JSON.parse(body).data[0].id;
      }
      catch (error) {
        console.log(`Error: ${JSON.stringify(res)}`);
      }
    });

  // base failure rate of 10%
  // additionally fails due to taking too long
  if (Math.random() > 0.1)
    setTimeout(() => markAsDone(topicId, messageId), Math.random() * 10000);

  // let's make this a bit more random than the publisher
  setTimeout(consume, Math.floor(Math.random() * 10));
};

const markAsDone = (topicId, messageId) => {
  request.delete(`http://localhost:3000/topics/${topicId}/${messageId}`);
  console.log(`done with: ${messageId}`);
};

// entry
consume();
