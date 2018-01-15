export const list = (req, res) => {
  // get a list of topics
  const data = global.db.getAllTopicsJSON();
  res.send({
    data
  });
};

export const create = (req, res) => {
  const { name, timeout } = req.body;
  let result;
  try {
    result = global.db.createTopic(name, timeout);
  }
  catch(err) {
    res.status(409).send({
      errors: [{
        title: "Duplicate topic name",
        detail: name
      }]
    });
    return;
  }

  res.send({
    data: [result]
  });
};

export const getStatus = (req, res) => {
  // get status for a topic
  res.send('status details for this topic');
};
