/* 	=================================
		MOTEUR DE JEU : CORE
	=================================
	script d'execution de l'environement
	
	v0.4
		- les runs des fourmis ne sont plus lancés par le core mais par les objets fourmis
		functionne avec classes/fourmis_v0.5.js
		- ajout des evenement objets

	v0.3
		Ajout des objets

	v0.2
		Séparation es Pheromones dans une classe gérée par classes/pheromones.js
		passage des phéromones aux objets fourmis

	v0.1
		Première verion
		tout est chargé en mémoire
*/


//var util = require("util");
var events = require("events");

var classPheromones = require('./classes/pheromones_v0.1');
var cFourmis = require('./classes/fourmis_v0.6');
var classObjets = require('./classes/objets_v0.1');
var nextIdFourmi = 0;

var fourmis = [];
var pheromones = new classPheromones.cPheromones();
var objets = new classObjets.cObjets();

//cFourmis.phs = pheromones;
//cFourmis.objs = objets;

console.log('cFourmis.phs :');
console.dir(cFourmis.phs);

chargerPheromones();
chargerObjets();
chargerFourmis();

// gestion des evenements
var coreEvents = new events.EventEmitter();
exports.coreEvents = coreEvents;
exports.sentPheromones = sentPheromones;
exports.sentObjets = sentObjets;


var runningFoumiId = 0;

// lancement de la boucle de calculs
//setInterval(core, 10);

// moteur
function core(){

	if(fourmis.length == 0) return;
	//console.log('----');
	//console.log('CORE FOURMI ' + runningFoumiId);
	// executer les actions des fourmis

	//var dataF = fourmis[runningFoumiId].getDatas();
	//console.log('Donnees de la fourmi :');
	//console.dir(dataF);
	//var senteurs = pheromones[0].sentirPheromones(dataF.clan, dataF.position, dataF.odorat);

	//console.log('Odorat fourmi :');
	//console.dir(senteurs);

	//console.log('objets :');
	//console.dir(objets);
	
	// actions fourmi
	fourmis[runningFoumiId].run();

	//console.dir(coreEvents);

	// remonté des nouvelles donnees
	/*dataF = fourmis[runningFoumiId].getDatas();
	coreEvents.emit('upFourmi', dataF);
	if(dataF.etat == 0){
		//coreEvents.emit('message', dataF.nom + ' est mort(e) !');
	}*/

	//coreEvents.emit('message', 'Run de' + dataF.nom);

	
	//fourmi suivante
	runningFoumiId ++;
	if(!(runningFoumiId < fourmis.length)) runningFoumiId = 0;
}

function sentPheromones(){
	pheromones.sentPheromones();
}
function sentObjets(){
	objets.upAll();
}

// calcul de distance
function distance(x1, y1, x2, y2){
	var xDif = x2 - x1;
	var yDif = y2 - y1;
	
	//console.log('distance :');
	//console.log('entrees : ' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2);
	
	xDif = xDif * xDif;
	yDif = yDif * yDif;
	
	//console.log('xdif = ' + xDif + ' yDif = ' + yDif);
	
	return Math.sqrt(xDif + yDif);
}
function angle(x1, y1, x2, y2){
	
}

/* =================================
	GESTION DES FOURMIS
================================= */

// evenements
cFourmis.dispEvents.on('message', function(data){
	//console.log('upPheromone sur core.js');
	//console.dir(coreEvents);	
	coreEvents.emit('message', data);
});
cFourmis.dispEvents.on('upFourmi', function(data){
	//console.log('upPheromone sur core.js');
	//console.dir(coreEvents);	
	coreEvents.emit('upFourmi', data);
});
cFourmis.dispEvents.on('killFourmi', function(data){
	// une fourmi est morte
	coreEvents.emit('message', 'Une fourmi est morte !');

	console.log('une fourmi est morte. On la cherche.');

	// tris en fonction de l'etat
	fourmis.sort(function(a, b){
		var dataA = a.getDatas();
		var dataB = b.getDatas();
		if(dataA.etat < dataB.etat) return -1;
		if(dataA.etat > dataB.etat) return 1;
		return 0;
	});

	var dataDead = fourmis[0].getDatas();
	coreEvents.emit('upFourmi', dataDead);
	if(dataDead.etat == 0){
		console.log('Suppression de la fourmi');
		fourmis.shift();

		// création d'un objet ressourcce
		var newObj = objets.add(2, dataDead.position);
		newObj.setData('reserve', dataDead.maxEnergie);
		newObj.setData('nom', dataDead.nom + ' mort(e)');
	}
});
cFourmis.dispEvents.on('newFourmi', function(data){
	createFourmi(data);
	console.log('Il y a ' + fourmis.length + ' fourmis sur le serveur.');
	coreEvents.emit('message', 'Il y a ' + fourmis.length + ' fourmis sur le serveur.');
})

// chargement des fourmis
function chargerFourmis(){
	console.log('CHARGEMENT DES FOURMIS');

	var fs = require('fs');
	var file = __dirname + '/data/fourmis.json';

	fs.readFile(file, 'utf8', function (err, data) {
		 if (err) {
			console.log("Echec du chargement des fourmis !");
			console.log('Error: ' + err);
			throw err;
			return;
		 }
	  	// données reçues
	  	var dataJSON = JSON.parse(data);
	  	for(var i = 0; i < dataJSON.length; i++){
	  		createFourmi(dataJSON[i]);
	  		
	  	}
	  	console.log(fourmis.length + ' fourmis chargées');
	});
		
}
function createFourmi(dataF){
	// création de l'objet fourmi
	switch(dataF.type){
		case 1: 
			var elementF = new cFourmis.cFourmiReine(nextIdFourmi, dataF.clan, dataF.position, pheromones, objets);
		break;
		case 2:
			var elementF = new cFourmis.cFourmiOuvriere(nextIdFourmi, dataF.clan, dataF.position, pheromones, objets);
		break;

		default : 
			console.log('ERREUR : type de fourmi inconnu. Remplacée par une ouvriere.')
			var elementF = new cFourmis.cFourmiOuvriere(nextIdFourmi, dataF.clan, dataF.position, pheromones, objets);
	}	  		
	// chargement des donnees
	elementF.setDatas(dataF);

	// events

	// ajout au troupeau
	fourmis.push(elementF);

	nextIdFourmi ++;
}

// ======================================
// GESTION PHEROMONES

// evenements
classPheromones.phsEvents.on('upPheromone', function(dataPh){
	//console.log('upPheromone sur core.js');
	//console.dir(coreEvents);	
	coreEvents.emit('upPheromone', dataPh);
});

// chargement des phéromones
function chargerPheromones(){
	console.log("CHARGEMENT DES PHEROMONES");

	var fs = require('fs');
	var file = __dirname + '/data/pheromones.json';

	fs.readFile(file, 'utf8', function (err, data) {
	  if (err) {
		console.log("Echec du chargement des pheromones !");
		console.log('Error: ' + err);
		return;
	  }
	  	var dataJSON = JSON.parse(data);
		for(i = 0; i < dataJSON.length; i++){
			pheromones.addPheromone(dataJSON[i].type, dataJSON[i].force, dataJSON[i].position);
		}
		//pheromones.push(phs);
		//console.log('Pheromones :');
		//console.dir(pheromones);
	});
	
}

// ======================================
// GESTION OBJETS

// evenements
classObjets.dispEvents.on('message', function(data){
	// pas traitement particulier	
	coreEvents.emit('message', data);
});
classObjets.dispEvents.on('upObjet', function(data){
	// pas traitement particulier
	coreEvents.emit('upObjet', data);
})

// chargement des objets
function chargerObjets(){
	console.log('CHARGEMENT DES OBJETS');
	var fs = require('fs');
	var file = __dirname + '/data/objets.json';

	fs.readFile(file, 'utf8', function (err, data) {
		if (err) {
			console.log("ERREUR : Echec du chargement des objets !");
			console.log('Error: ' + err);
			return;
		}
	  	var dataJSON = JSON.parse(data);
		for(var i in dataJSON){
			var nObj = objets.add(dataJSON[i].type, dataJSON[i].position);
			//console.log('Nouvel objet chargé :');
			//console.dir(nObj);
			nObj.setDatas(dataJSON[i]);
		}
		console.log(dataJSON.length + ' objets chargés');
	});
}
