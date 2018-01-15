const sweeper = () => {
  const topics = global.db.getAllTopicsJSON();

  // this is currently O(n^2) with regards to the # of topics. using a proper
  // db will bring it down to O(n)
  topics.forEach((topic) => {
    global.db.getTopicByID(topic.id).requeueTimedOutMessages();
  });
};

export default sweeper;
