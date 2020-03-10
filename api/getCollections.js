const getDbConnection = require("./_utils/getDbConnection");

module.exports = async (req, res) => {
  const db = await getDbConnection();

  const collections = await db.collections();

  const payload = collections.reduce((result, i) => {
    const name = i.s.namespace.collection;
    if (name !== "system.indexes") {
      result.push({
        text: name,
        href: "#/" + name
      });
    }

    return result;
  }, []);

  res.send({
    type: "collectionList",
    payload
  });
};
