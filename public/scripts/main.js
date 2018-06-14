'use strict';

$(document).ready(function () {

			var model = new Model();
			var view = new View(model, {
						'$audio': $('audio'),
						'$button__next': $('.button__next'),
						'$button__play': $('.button__play'),
						'$button__prev': $('.button__prev'),
						'$list': $('.list'),
						'$player': $('.player')
			});
			var controller = new Controller(model, view);
});