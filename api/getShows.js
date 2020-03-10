const getDbConnection = require("./_utils/getDbConnection");

module.exports = async (req, res) => {
  const db = await getDbConnection();
  const collection = req.url.split("/")[2];
  const year = req.url.split("/")[3]; // Year is either a 4-digit number, "Unspecified", and hopefully never anything else
  let pipeline;

  // if date is a date, compare year to year. If it is null, compare it to year
  try {
    if (year.match(/^\d\d\d\d$/)) {
      let nextYear = parseFloat(year) + 1;

      pipeline = [
        {
          $match: {
            date: {
              $type: "date",
              $gte: new Date(`${year}-01-01T00:00:00Z`),
              $lt: new Date(`${nextYear}-01-01T00:00:00Z`)
            }
          }
        }
      ];
    } else if (year === "Unspecified") {
      pipeline = [{ $match: { date: { $type: "null" } } }];
    } else {
      throw `Unexpected year: ${year}`;
    }

    const query = await db.collection(collection).aggregate(pipeline);

    if (!query) {
      return console.log(err);
    }

    const arr = await query.toArray();

    let data = { type: "shows", results: [] };

    arr.forEach(show => {
      let obj = {};
      var mp3 = show.tracks.find(track => track.uri.slice(-3) === "mp3");

      if (show.date instanceof Date) {
        obj.date = {
          year: show.date.getFullYear(),
          month: show.date.getMonth() + 1,
          day: show.date.getDate()
        };
      } else {
        obj.date = null;
      }

      obj.subject = show.subject;
      obj.venue = show.venue;
      obj.title = show.title;
      (obj.duration = mp3.duration),
        (obj.track = mp3.track),
        (obj.data_src =
          "http://archive.org/download" +
          show.dir.replace(/\/\d+\/items/, "") +
          "/" +
          mp3.uri),
        (obj.href =
          `/#/${collection}/${year.toString()}/` +
          String(show.title)
            .replace(/\s/g, "-")
            .replace(/\'/g, ""));

      data.results.push(obj);
    }); // results.foreach

    res.send(data);
  } catch (e) {
    console.log(e);
  }
};
