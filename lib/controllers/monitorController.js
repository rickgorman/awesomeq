export const showEveryStatus = (req, res) => {
  let result = [];

  const topics = global.db.getAllTopicsJSON();

  topics.forEach((topic) => {
    try {
      result.push(global.db.getTopicByID(topic.id).getDetailsJSON());
    }
    catch (err) {
      result.push(["error"]);
    }
  });

  res.send(result);
};
