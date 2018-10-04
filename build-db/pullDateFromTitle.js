// This script gets items whose date is null, and whose title matches REGX
// uses that string to make a date obj. Then the date obj gets put into the `date` key and the item gets updated

const COLLECTION = "bob-dylan"
const REGX = /(\d{2,4})-(\d{1,2})-(\d{1,2})/
// need to use the regex from smdb script and parse it more responsibly.

var MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

MongoClient.connect(process.env.DB_URI, function(err, client) {
  let db = client.db('smdb')
  db.collection(COLLECTION).find({date: null, title: { $regex: REGX } })
	.toArray(function(err, result) {
    if(err) console.log(err);

		result.forEach((item) => {
      let date, day, month, year;
      let dateStrMatches = item.title.match(REGX)

      // set year
      if (dateStrMatches[1].length == 2) {
        year = parseFloat(dateStrMatches[1]) > 50
              ? '19' + dateStrMatches[1]
              : '20' + dateStrMatches[1]
      } else if (dateStrMatches[1].length == 4) {
        year = dateStrMatches[1]
      } else {
        console.log('WEIRD YEAR');
      }


      // set month
      if (dateStrMatches[2].length == 1) {
        month = '0' + dateStrMatches[2]
      }
      else if (dateStrMatches[2].length == 2) {
        month = dateStrMatches[2]
      }
      else console.log('WEIRD MONTH');

      //set day
      if (dateStrMatches[3].length == 1) {
        day = '0' +  dateStrMatches[3]
      }
      else if (dateStrMatches[3].length == 2) {
        day = dateStrMatches[3]
      }
      else console.log('WEIRD DAY');

      date = new Date(`<${year}-${month}-${day}>`)

      if (date) {
        db.collection(COLLECTION).update(
        { _id: item._id },
        { $set: { date: date } }
        )
      }
    })

    client.close();
	})
});
