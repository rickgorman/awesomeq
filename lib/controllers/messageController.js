// get a message from the topic
export const receiveMessage = (req, res) => {
  const topicId = parseInt(req.params.topicId);
  let messageJSON;
  try {
    messageJSON = global.db.getTopicByID(topicId).receiveMessage();
  }
  catch (err) {
    res.status(204).send({});
    return;
  }

  res.send(messageJSON);
};

// add a message to the topic
export const sendMessage = (req, res) => {
  const topicId = parseInt(req.params.topicId);
  const { messageBody } = req.body;
  let message;

  try {
    const topic = global.db.getTopicByID(topicId);
    message = topic.sendMessage(messageBody);
  }
  catch (err) {
    res.status(404).send({
      errors: [{
        title: "Topic does not exist",
        detail: topicId
      }]
    });
    return;
  }

  res.send({
    data: [
      message
    ],
    relationships: {
      topic: {
        data: {
          id: topicId
        }
      }
    }
  });
};

// mark a message as done
export const acknowledgeCompletion = (req, res) => {
  res.send('messaged marked as completed');
};
