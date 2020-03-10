const getDbConnection = require("./_utils/getDbConnection");

module.exports = async (req, res) => {
  const collection = req.url.split("/api/")[1];

  const db = await getDbConnection();

  const query = await db.collection(collection).aggregate([
    {
      $project: {
        year: {
          $cond: {
            if: { $eq: [{ $type: "$date" }, "date"] },
            then: { $year: "$date" },
            else: "Unspecified"
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        distinctDate: { $addToSet: { year: "$year" } }
      }
    }
  ]);

  if (!query) {
    return console.log("Error: ", err);
  }

  const arr = await query.toArray();

  let listItems = { type: "years", results: [] };

  arr[0]["distinctDate"]
    .sort(function(a, b) {
      return b.year - a.year;
    })
    .forEach(function(year) {
      listItems.results.push({
        href: "#/" + collection + "/" + year["year"],
        text: year["year"]
      });
    });

  res.send(listItems);
};
