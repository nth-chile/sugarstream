$(document).ready(function() {
  const model = new Model();
  const view = new View(model, {
    $audio: $("audio"),
    $button__next: $(".button__next"),
    $button__play: $(".button__play"),
    $button__prev: $(".button__prev"),
    $list: $(".list"),
    $player: $(".player")
  });
  const controller = new Controller(model, view);

  var modal = document.getElementById("modal-1");
  var btn = document.getElementById("modal-1-btn");
  var span = document.getElementsByClassName("close")[0];

  btn.onclick = function() {
    modal.style.display = "block";
  };

  span.onclick = function() {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});
