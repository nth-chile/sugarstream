$(document).ready(function() {

const model = new Model();
const view = new View(model, {
			'$audio': $('audio'),
			'$button__next': $('.button__next'),
			'$button__play': $('.button__play'),
			'$button__prev': $('.button__prev'),
			'$list': $('.list'),
			'$player': $('.player')
		});
const controller = new Controller(model, view);


});