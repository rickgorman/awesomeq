const sweeper = () => {
  const topics = global.db.getAllTopicsJSON();

  // this is currently O(n^2) with regards to the # of topics. using a proper
  // db will bring it down to O(n)
  topics.forEach((topic) => {
    let requeueCount =
      global.db.getTopicByID(topic.id).requeueTimedOutMessages();
      
    console.log(`looking at: ${topic.name} -- requeued: ${requeueCount}`);
  });
};

export default sweeper;
