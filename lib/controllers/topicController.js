export const list = (req, res) => {
  // get a list of topics
  const data = global.db.getAllTopicsJSON();
  res.send({
    data
  });
};

export const create = (req, res) => {
  // create a new topic
  res.send('create a new topic');
};

export const getStatus = (req, res) => {
  // get status for a topic
  res.send('status details for this topic');
};
