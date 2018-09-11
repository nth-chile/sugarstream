'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// But the handlers go in the controller

function Model() {
  window.onhashchange = this.selectListItem.bind(this);
  this.currentTrackIndex = -1;
  this.trackList = null;

  this.listItemSelected = new Event(this);
  this.uriIncludesTrack = new Event(this);
  this.trackSelected = new Event(this);
  this.trackChanged = new Event(this);

  this.selectListItem();
}
Model.prototype = {
  buildTrackList: function buildTrackList(trackList) {
    this.trackList = trackList;
  },
  getListData: function getListData(hash) {
    var _this = this;

    return $.get(hash).then(function (res) {
      return _this.data = res;
    });
  },
  selectListItem: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var hash;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              hash = 'api' + (!!window.location.hash.substr(1) ? window.location.hash.substr(1) : '/collections');


              console.log(hash);

              /* Possible hashes
              *  api/collections
              *  api/:collection-name
              *  api/:collection-name/:yyyy
              *  api/:collection-name/:yyyy/:item-name
              *  api/:collection-name/Unspecified
              *  api/:collection-name/Unspecified/:item-name
              */

              _context.next = 4;
              return this.getListData(hash);

            case 4:
              // this.data is set by getListData
              this.listItemSelected.notify(this.data);

              if (
              // api/:collection-name/:yyyy/:item-name
              hash.match(/^api\/(.*)\/\d\d\d\d\/(.*)$/) ||
              // api/:collection-name/Unspecified/:item-name
              hash.match(/^api\/(.*)\/Unspecified\/(.*)$/)) {
                this.uriIncludesTrack.notify(hash);
              }

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function selectListItem() {
      return _ref.apply(this, arguments);
    }

    return selectListItem;
  }(),
  selectNext: function selectNext() {
    this.updateCurrentTrack(this.currentTrack + 1);
  },
  selectPrev: function selectPrev() {
    this.updateCurrentTrack(this.currentTrack - 1);
  },
  updateCurrentTrack: function updateCurrentTrack(index) {
    if (-1 < index && index < this.trackList.length) this.currentTrack = index;else if (index == -1) this.currentTrack = 0;
    this.trackSelected.notify({
      date: this.data.date,
      sourceTitle: this.data.sourceTitle,
      subject: this.data.subject,
      title: this.data.title,
      trackData: this.trackList[this.currentTrack],
      venue: this.data.venue
    });
  }
};