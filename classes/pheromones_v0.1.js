/* 	=================================
		GESTION DES PHEROMONES
	=================================

	v0.1
		Première verion
		Apparait avec le v0.2 de CORE

		Suppression de la gestion des clans.
		(Un clan = une instance de cPheromones ?)
*/

// EXPORT des CLASSES
exports.cPheromones = cPheromones;


// EVENEMENTS
var events = require("events");
var phsEvents = new events.EventEmitter();
exports.phsEvents = phsEvents;


function cPheromones(){
	// constructeur de la classe de gestion des phéromones
	this.data = [];
	this.nextID = 0;
	//this.evts = new events.EventEmitter();

	// lancement du nettoyage
	var self = this;
	setInterval(function(){
		// nettoyage des pheromones
		//console.log('Nettoyage des pheromones :');

		var timeStampNow = Math.round(new Date().getTime() / 1000);
		//console.log('timeStampNow = ' + timeStampNow);
		var i = 0;
		while((i < self.data.length/10)){ // on ne fait qu'une partie
			var ph = self.data[i];
			//console.log('ph :');
			//console.dir(ph);

			
				//console.log('ph.deadline = '+ph.deadline);
			if(ph.deadline < timeStampNow){
				//console.log('Suppression !')
				var phDead = self.data.shift();
				var dataPh = phDead.getDatas();
				dataPh.force = 0;
				phsEvents.emit('upPheromone', dataPh);
				/*console.log('Pheromones :');
				console.dir(pheromones);*/
			}
			i ++;
		}
		//console.log(self.data.length+' restantes');
	}, 5000);
}

cPheromones.prototype.addPheromone = function(type, force, position){
	var ph = new cPheromone(this.nextID, type, force, position, 200);
	this.data.push(ph);
	this.nextID ++;

	// diffusion de l'info
	//console.log('Nouvelle pheromone');
	var dataPh = ph.getDatas();
	phsEvents.emit('upPheromone', dataPh);
}

cPheromones.prototype.sentirPheromones = function(positionF, odorat){
	var senteurs = [];
	//var nbSenties = 0
	var distMin = [];

	for(var j in this.data){
		var ph = this.data[j];
		//console.log('sens ph = ' + ph.position.sens);

		// calcul de la perception de la pheromones
		var dist = 1 + distance(positionF.x, positionF.y, ph.position.x, ph.position.y); // + 1 pour éviter les distance < 1 pour la division
		var force = ph.force * odorat;
		force = force / dist;

		
		if(force > 0.3){
			//nbSenties ++;
			//console.log('Pheromone de type '+ph.type+' sentie à ' + force);
			// ajoute des phéromones au tableau s'il en manque
			var idS = -1;
			for(var i in senteurs){
				if(senteurs[i].type == ph.type){
					idS = i;
					break;
				}
			}
			if(idS == -1){
				idS = senteurs.length;
				senteurs.push(new cPheromone(0, ph.type, 0, {x: 0, y:0, sens: 0}, 0));
				distMin.push(dist);
			}
			
			// ajout à la phéromone pondérée
			senteurs[idS].position.x = (force * ph.position.x + senteurs[idS].force * senteurs[idS].position.x) / (force + senteurs[idS].force);
			senteurs[idS].position.y = (force * ph.position.y + senteurs[idS].force * senteurs[idS].position.y) / (force + senteurs[idS].force);
			senteurs[idS].force  += force;

			// prise en compte du sens de la phéromone
			if(dist < distMin[idS]){
				distMin[idS] = dist;
				senteurs[idS].position.sens = ph.position.sens;
			}

			//console.log('senteurs[idS].position : ');
			//console.dir(senteurs[idS].position);
		}
		
		//console.log("Pheromone a " + dist);
		//console.log("sentie a " + force);


	}
	// tri du tableau
	//console.log('senteurs :');
	//console.dir(senteurs);
	senteurs.sort(function(a, b){
		if(a.type < b.type) return -1;
		if(a.type > b.type) return 1;
		return 0;
	});
	//console.log('triee');
	//console.dir(senteurs);

	//console.log(nbSenties + ' pheromones senties');
	return senteurs;
}
cPheromones.prototype.sentPheromones = function(){
	for(var i in this.data){
		var dataPh = this.data[i].getDatas();
		phsEvents.emit('upPheromone', dataPh);
	}
}

// ================
// CLASSE PHEROMONE
function cPheromone(id, type, force, position, duree){
	this.id = id;
	this.type = type;	
	this.force = force;
	this.position = position; // {x, y, sens}
	this.deadline = Math.round(new Date().getTime() / 1000) + duree;
}
cPheromone.prototype.getDatas = function(){
	var data = {
		id: this.id,
		type : this.type,
		force: this.force,
		position: this.position
	}
	return data;
}

// FONCTION OUTILS
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