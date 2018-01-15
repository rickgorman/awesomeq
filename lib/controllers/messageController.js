export const receiveMessage = (req, res) => {
  // get a message from the topic
  res.send('receieve a message');
};

export const sendMessage = (req, res) => {
  // add a message to the topic
  res.send('added a message');
};

export const acknowledgeCompletion = (req, res) => {
  // mark a message as done
  res.send('messaged marked as completed');
};
