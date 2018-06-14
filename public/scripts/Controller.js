'use strict';

function Controller(model, view) {
  var _this = this;

  this.model = model;
  this.view = view;
  this.audio = this.view.elements.$audio;
  this.playBtn = this.view.elements.$button__play;

  // Attach view handlers
  this.view.backBtnSelected.attach(function (sender, args) {
    _this.back();
    _this.model.trackList = null;
    _this.model.selectListItem();
  });
  this.view.playBtnSelected.attach(function (sender, args) {
    if (!_this.playBtn.hasClass('playing')) _this.play();else _this.pause();
  });
  this.view.prevBtnSelected.attach(function (sender, args) {
    _this.prev();
  });
  this.view.nextBtnSelected.attach(function (sender, args) {
    _this.next();
  });
  this.view.trackSelected.attach(function (sender, args) {
    if (!_this.model.trackList) {
      var listItems = _this.view.elements.$list[0].children;
      var trackList = [];
      for (var i = 0; i < listItems.length; i++) {
        trackList.push(listItems[i].children[0].trackData);
      }
      _this.model.buildTrackList(trackList);
    }

    _this.selectTrack(args);
  });
}
Controller.prototype = {
  selectTrack: function selectTrack(index) {
    this.model.updateCurrentTrack(index);
    this.play();
  },
  back: function back() {
    var hash = window.location.hash.substr(1);
    window.history.pushState({}, '', '#' + hash.slice(0, hash.lastIndexOf('/')));
  },
  next: function next() {
    this.model.selectNext();
  },
  pause: function pause() {
    this.audio[0].pause();
    this.playBtn.removeClass('playing');
  },
  play: function play() {
    this.audio[0].play();
    this.playBtn.addClass('playing');
  },
  prev: function prev() {
    this.model.selectPrev();
  }
};