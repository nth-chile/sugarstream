function View(model, elements) {
  this.model = model
  this.elements = elements

  //to add listeners to new list items
  this.backBtnSelected = new Event(this)
  this.playBtnSelected = new Event(this)
  this.prevBtnSelected = new Event(this)
  this.nextBtnSelected = new Event(this)
  this.trackSelected = new Event(this)

  // Attach model listeners
  this.model.listItemSelected.attach((sender, args) => {
    this.updateList(args)
    this.assignTrackSelectListeners()
  })
  this.model.trackSelected.attach((sender, args) => {
    this.unhidePlayer()
    this.updatePlayer(args)
  })
  this.model.uriIncludesTrack.attach((sender, args) => {
    this.trackSelectedFromHash(args)
  })

  // Attach listeners to DOM
  this.elements.$button__play.click(() => {
    this.playBtnSelected.notify()
  })
  this.elements.$button__prev.click(() => {
    this.prevBtnSelected.notify()
  })
  this.elements.$button__next.click(() => {
    this.nextBtnSelected.notify()
  })
  $('.button__back').click(() => {
    this.backBtnSelected.notify()
  })
  this.elements.$player
    .find('.player__bar')
    .on('mousedown', this.seek.bind(this))
  this.elements.$audio.on('ended', this.onEnded.bind(this))
}
View.prototype = {
  addOnLoadedMetadataHandler: function(args) {
    const $audio = this.elements.$audio
    const $player = this.elements.$player

    $audio.on('loadedmetadata', onLoadedMetadataHandler)
    this.addOnTimeupdateHandler(args)

    function onLoadedMetadataHandler(e) {

      const year = args.date && args.date.year
                    ? args.date.year
                    : ''
      const month = args.date && args.date.year
                    ? args.date.month.toString().length == 1 ? '0'.concat(args.date.month) : args.date.month
                    : ''
      const day = args.date && args.date.year
                    ? args.date.day.toString().length == 1 ? '0'.concat(args.date.day) : args.date.day
                    : ''

      var m = Math.floor(e.target.duration / 60)
      var s = Math.floor(e.target.duration % 60)
      m.toString()
      s = s < 10 ? '0'.toString().concat(s) : s

      $player.find('.player__date').html(`${month}-${day}-${year} &mdash; `)
      $player.find('.player__duration').html(`${m}:${s}`)
      $player.find('.player__title').html(args.trackData.title)
      $player.find('.player__venue').html(args.venue)
    }
  },
  addOnTimeupdateHandler: function(args) {
    const $audio = this.elements.$audio
    const $player = this.elements.$player

    $audio.on('timeupdate', onTimeupdateHandler)

    function onTimeupdateHandler(e) {
      const elapsed = e.target.currentTime
      var m = Math.floor(e.target.currentTime / 60)
      var s = Math.floor(e.target.currentTime % 60)
      m.toString()
      s = s < 10 ? '0'.toString().concat(s) : s

      this.progressWidth =
        Math.round(
          e.target.currentTime * $('.player__bar').width() / e.target.duration
        ) + 'px'

      $player.find('.player__elapsed').html(`${m}:${s}`)
      $player.find('.player__progress').width(this.progressWidth)
    }
  },
  assignTrackSelectListeners: function() {
    $('.list__item--track').click(e => {
      if (e.target.tagName == 'A') {
        const trackIndex = this.getElementIndex(e.target.parentElement)
        this.trackSelected.notify(trackIndex)
      } else if (e.target.tagName == 'LI') {
        console.log('itsand li')
        const trackIndex = this.getElementIndex(e.target)
        this.trackSelected.notify(trackIndex)
      } else {
        console.log('Error: Event.target.tagName is neither "A" nor "LI".')
      }
    })
  },
  getElementIndex: function(node) {
    var index = 0
    while ((node = node.previousElementSibling)) {
      index++
    }
    return index
  },
  onEnded: function(e) {
    this.nextBtnSelected.notify()
  },
  seek: function seek(e) {
    var _this5 = this

    e.preventDefault()
    this.updateTime(e)
    if (e.buttons == 1) {
      this.elements.$player.find('.player__bar').on('mousemove', function(e) {
        _this5.updateTime(e)
        $(window).on('mouseup', function(e) {
          _this5.elements.$player.find('.player__bar').off('mousemove')
        })
      })
    }
  },
  trackSelectedFromHash: function(hash) {
    let selectedTrackName = hash.slice( hash.lastIndexOf('/') + 1 )

    this.elements.$list.find('.list__item__link').each((index, item) => {
      item = item.toString()
      let itemName = item.slice( item.lastIndexOf('/') + 1 )
      if (selectedTrackName == itemName) {
        this.trackSelected.notify(index)
      }
    })
  },
  updateTime: function updateTime(e) {
    var player__bar = document.querySelector('.player__bar')
    var boundingRect = player__bar.getBoundingClientRect()
    this.elements.$audio[0].currentTime = Math.round(
      (e.clientX - boundingRect.left) *
        this.elements.$audio[0].duration /
        this.elements.$player.find('.player__bar').width()
    )
  },
  unhidePlayer: function() {
    this.elements.$player.removeClass('hidden')
    this.elements.$list.removeClass('no-margin')
  },
  updateList: function(data) {
    if (data.type == 'years') {
      this.elements.$list.html('')

      data.results.forEach(date => {
        let $li = $('<li></li>')
        let $a = $('<a></a>')
        $li.addClass('list__item')
        $a.addClass('list__item__link')
        $a.attr('href', date.href)
        $a.html(date.text)

        $li.append($a)
        this.elements.$list.append($li)
      })
    } else if (data.type == 'collectionList') {
      this.elements.$list.html('')

      let collections = data.payload.map((item) => {
        let map = {
          "alabama-shakes": "Alabama Shakes",
          "allen-ginsberg": "Allen Ginsberg",
          "arlo-guthrie": "Arlo Guthrie",
          "bb-king": "B.B. King",
          "bob-dylan": "Bob Dylan",
          "bob-marley": "Bob Marley",
          "bruce-springsteen": "Bruce Springsteen",
          "buzzcocks": "Buzzcocks",
          "captain-beefheart": "Captain Beefheart",
          "carlos-santana": "Carlos Santana",
          "cat-stevens": "Cat Stevens",
          "chick-corea": "Chick Corea",
          "creedence-clearwater-revival": "Creedence Clearwater Revival",
          "dave-matthews-band": "Dave Matthews Band",
          "david-bowie": "David Bowie",
          "duke-ellington": "Duke Ellington",
          "elizabeth-cotten": "Elizabeth Cotten",
          "elvis-costello": "Elvis Costello",
          "elvis-presley": "Elvis Presley",
          "eric-burdon": "Eric Burdon",
          "eric-clapton": "Eric Clapton",
          "etta-james": "Etta James",
          "faces": "Faces",
          "flaming-lips": "Flaming Lips",
          "frank-zappa": "Frank Zappa",
          "george-clinton": "George Clinton",
          "government-mule": "Government Mule",
          "grand-funk-railroad": "Grand Funk Railroad",
          "herbie-hancock": "Herbie Hancock",
          "hunter-s-thompson": "Hunter S. Thompson",
          "ian-anderson": "Ian Anderson",
          "iggy-pop": "Iggy Pop",
          "jack-kerouac": "Jack Kerouac",
          "jackson-browne": "Jackson Browne",
          "jaco-pastorius": "Jaco Pastorius",
          "jerry-garcia": "Jerry Garcia",
          "jimi-hendrix": "Jimi Hendrix",
          "jimmy-cliff": "Jimmy Cliff",
          "joe-bonamassa": "Joe Bonamassa",
          "john-lennon": "John Lennon",
          "johnny-cash": "Johnny Cash",
          "jon-fishman": "Jon Fishman",
          "keller-williams": "Keller Williams",
          "king-crimson": "King Crimson",
          "king-gizzard-and-the-lizard-wizard": "King Gizzard & The Lizard Wizard",
          "led-zeppelin": "Led Zeppelin",
          "leonard-cohen": "Leonard Cohen",
          "lou-reed": "Lou Reed",
          "lynyrd-skynyrd": "Lynyrd Skynyrd",
          "michael-jackson": "Michael Jackson",
          "mickey-hart": "Mickey Hart",
          "mike-gordon": "Mike Gordon",
          "miles-davis": "Miles Davis",
          "moe": "Moe",
          "muddy-waters": "Muddy Waters",
          "neil-young": "Neil Young",
          "nico": "Nico",
          "page-mcconnell": "Page McConnell",
          "paul-simon": "Paul Simon",
          "pearl-jam": "Pearl Jam",
          "phil-spector": "Phil Spector",
          "pink-floyd": "Pink Floyd",
          "primus": "Primus",
          "queen": "Queen",
          "rage-against-the-machine": "Rage Against the Machine",
          "red-hot-chili-peppers": "Red Hot Chili Peppers",
          "steve-miller": "Steve Miller",
          "stevie-wonder": "Stevie Wonder",
          "sublime": "Sublime",
          "syd-barrett": "Syd Barrett",
          "t-rex": "T. Rex",
          "talking-heads": "Talking Heads",
          "television": "Television",
          "tenacious-d": "Tenacious D",
          "the-allman-brothers-band": "The Allman Brothers Band",
          "the-b52s": "The B-52s",
          "the-beatles": "The Beatles",
          "the-clash": "The Clash",
          "the-doors": "The Doors",
          "the-moody-blues": "The Moody Blues",
          "the-police": "The Police",
          "the-ramones": "The Ramones",
          "the-rolling-stones": "The Rolling Stones",
          "the-white-stripes": "The White Stripes",
          "the-who": "The Who",
          "tom-petty": "Tom Petty",
          "tom-waits": "Tom Waits",
          "tool": "Tool",
          "townes-van-zandt": "Townes Van Zandt",
          "traveling-wilburys": "Traveling Wilburys",
          "trey-anastasio": "Trey Anastasio",
          "ub40": "UB40",
          "warren-haynes": "Warren Haynes",
          "ween": "Ween",
          "wilco": "Wilco",
          "woody-guthrie": "Woody Guthrie",
          "zakir-hussain": "Zakir Hussain"
        };

        return { text: map[item.text], href: item.href }
      });



      collections.sort((a, b) => {
        a = a.text.replace(/^the\s/i, '').toUpperCase()
        b = b.text.replace(/^the\s/i, '').toUpperCase()

        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        // a must be equal to b
        return 0;
      })

      collections.forEach(collection => {
        let $li = $('<li></li>')
        let $a = $('<a></a>')
        $li.addClass('list__item')
        $a.addClass('list__item__link')
        $a.attr('href', collection.href)
        $a.html(collection.text)

        $li.append($a)
        this.elements.$list.append($li)
      })
    } else if (data.type == 'shows') {
      this.elements.$list.html('')

      data.results.forEach(show => {
        let $li = $('<li></li>')
        let $a = $('<a></a>')
        let $span = $('<span></span>')
        $li.addClass('list__item list__item--track')
        $a.addClass('list__item__link')
        $a.attr('href', show.href)
        $a.html(show.title)
        $span.html(show.duration)
        $span.addClass('list__item__duration')
        $.extend($a[0], {
          trackData: {
            data_src: show.data_src,
            duration: show.duration,
            title: show.title
          }
        })

        $li.append($a)
        $li.append($span)
        this.elements.$list.append($li)
      })
    }
  },
  updatePlayer: function(args) {
    const $audio = this.elements.$audio
    const $player = this.elements.$player

    $audio.attr('src', args.trackData.data_src)
    this.addOnLoadedMetadataHandler(args)
  }
}
