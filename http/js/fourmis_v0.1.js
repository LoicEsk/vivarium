/*
	Gestion des fourmis coté client

	v0.1
		Gestion des fourmis mais pas de classe
*/


// mise à jour est donnees
function setFourmi(data){
	//console.log('Fourmi de type '+data.type+' recue');

	// MAJ menu
	var blocFourmi = $('#infoF' + data.id);
	if(blocFourmi.length == 0){ // element inexistant
		// création de l'element DOM
		var blocFourmi = newFourmiHTML(data.id, data.type);
	}
	$('.nom', blocFourmi).text(data.nom);
	$('.etat', blocFourmi).text(txtEtat[data.etat]);
	$('.position', blocFourmi).text(data.position.x + ', ' + data.position.y);

	// MAJ graphique
	var fourmiKinetic = stage.find('#f'+data.id);
	if(fourmiKinetic.length == 0){
		// création de la fourmi kineticjs
		var fourmiKinetic = newFourmiKinetic(data.id, data.type)
	}else fourmiKinetic = fourmiKinetic[0];
	fourmiKinetic.setX(data.position.x);
	fourmiKinetic.setY(data.position.y);
	stage.draw();
	

}

function newFourmiHTML(idF, typeF){
	//console.log('Nouvelle fourmi type '+typeF);

	// création de l'element
	var newBlocFourmi = $('<div id="infoF'+idF+'"/>');
	newBlocFourmi.append($('<div/>').addClass('nom'));
	newBlocFourmi.append($('<div/>').append($('<div/>').addClass('barEnergie')));
	newBlocFourmi.append($('<div/>').addClass('etat'));
	newBlocFourmi.append($('<div/>').addClass('position'));

	$('#fourmis-T'+typeF).append(newBlocFourmi);
	return newBlocFourmi;
}
function newFourmiKinetic(idF, type){
	// création de l'element graphihque

	console.log('Nouvelle fourmi Kinetic')

	var grF = new Kinetic.Group({
		id: 'f' + idF,
		x: 200,
		y: 100
	});
	var cercle1 = new Kinetic.Circle({
		x: 0,
		y: 0,
		radius: 5,
		fill: 'brown',
	});
	var cercle2 = new Kinetic.Circle({
		x: 2,
		y: 0,
		radius: 2,
		fill: 'white',
	});
	grF.add(cercle1);
	grF.add(cercle2);

	layer.add(grF);

	return grF;
}