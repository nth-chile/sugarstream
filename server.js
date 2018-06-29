var express = require('express')
var path = require('path')
var MongoClient = require('mongodb').MongoClient
var compression = require('compression')
var app = express()
var db
require('dotenv').config()
var mongoURI = process.env.DB_URI

// // Connect to database and set var db
MongoClient.connect(mongoURI, function(err, database) {
  if (err) console.error(err)
  else db = database
})

// Deters attackers who target Express apps
app.disable('x-powered-by')

// Compress all routes
app.use(compression())

// Set static path
app.use(express.static(path.join(__dirname, 'public')))



/* ROUTES
*  api/collections
*  api/:collection-name
*  api/:collection-name/:yyyy
*  api/:collection-name/Unspecified
*  api/:collection-name/:yyyy/:item-name
*  api/:collection-name/Unspecified/:item-name
*/

app.get('/api/collections', function(req, res) {
  getCollections(res)
})

app.get('/api/:collection', function(req, res) {
  let collection = req.params.collection
  getYears(res, collection)
})

app.get('/api/:collection/:year', function(req, res) {
  getShows(res, req.params.collection, req.params.year)
})

app.get('/api/:collection/:year/:show', function(req, res) {
  getShows(res, req.params.collection, req.params.year)
})

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.listen(8081, function() {
  console.log('Server started on port 8081.')
})


///////////////
// FUNCTIONS //
///////////////

function getCollections(res) {
  db.collections((error, collections) => {
    if (error) res.send(error)

    let arr = []

    collections.map(item => {
      if (item.s.name !== 'system.indexes') {
        arr.push({
          text: item.s.name,
          href: '#/' + item.s.name
        })
      }
    })

    res.send({
      type: 'collectionList',
      payload: arr
    })
  })
}

function getYears(res, collection) {
  // collection is either a band name or "Unspecified"

  db.collection(collection).aggregate(
    [
      {
        $project: {
          year: {
            $cond: {
                if: { $eq : [ { $type: "$date" }, "date" ] },
                then: { $year: '$date' },
                else: 'Unspecified'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          distinctDate: {
            $addToSet: {
              year:  '$year'
            }
          }
        }
      }
    ],
    function(err, result) {
      if (err) console.log('Error: ', err)
      else {
        let listItems = { type: 'years', results: [] }
        result[0]['distinctDate']
          .sort(function(a, b) {
            return b.year - a.year
          })
          .forEach(function(year) {
            listItems.results.push({
              href: '#/' + collection + '/' + year['year'],
              text: year['year']
            })
          })
        res.send(listItems)
      }
    }
  )
}

function getShows(res, collection, year) {
  // Year is either a 4-digit number, "Unspecified", and hopefully never anything else
  let pipeline
  // if date is a date, compare year to year. If its null, compare it to year

  try {
    if ( year.match(/^\d\d\d\d$/) ) {
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
      ]
    } else if ( year === 'Unspecified' ) {
      pipeline = [
        {
          $match: {
            date: { $type: 'null' }
          }
        }
      ]
    } else {
      throw `Unexpected year: ${year}`
    }

    db.collection(collection).aggregate(
      pipeline,
      function(err, result) {
        if (err) console.error(err)

        else {
          let data = { type: 'shows', results: [] }

          result.forEach((show) => {
            let obj = {}
            var mp3 = show.tracks.find(track => track.uri.slice(-3) === "mp3")

            if (show.date instanceof Date) {
              obj.date = {
                year: show.date.getFullYear(),
                month: show.date.getMonth() + 1,
                day: show.date.getDate()
              }
            } else {
              obj.date = null
            }

            obj.subject = show.subject
            obj.venue = show.venue
            obj.title = show.title
            obj.duration = mp3.duration,
            obj.track = mp3.track,
            obj.data_src = 'http://archive.org/download'
                        + show.dir.replace(/\/\d+\/items/, '')
                        + '/' + mp3.uri,
            obj.href = `/#/${collection}/${year.toString()}/` +
                      String(show.title)
                        .replace(/\s/g, '-')
                        .replace(/\'/g, '')

            data.results.push(obj)
          }) // results.foreach
          res.send(data)
        } // else
      } // cb
    ) // aggregate
  } // try
  catch (e) {
    console.log(e)
  }
}
