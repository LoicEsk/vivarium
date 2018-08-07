/* 	=================================
		CLASSES FOURMIS
	=================================
	
	v0.6
		modification des run pour mieux gérer la charge de calcul serveur

	v0.5
		les run sont lancé par les classes formis (core v0.4)

	v0.4
		Entrée en code de la reine
		ajout des evenements

	v0.3
		Refonte du run de cFourmiOuvriere (ouvriere)
		ajout de l'energie de la fourmi

	v0.2
		les phéromones sont gérés directement ici par les classes fourmis et non plus dans le CORE
		Début de l'implantation des objets

	v0.1
		classes fourmis mais pas de gestion des troupeaux
		version avec toutes les classes de fourmis
*/
exports.cFourmiOuvriere = cFourmiOuvriere;
exports.cFourmiReine = cFourmiReine;

// liens des les pheromones et objets
/*var phs;
var objs;
exports.phs = phs;
exports.objs = objs;*/

// EVENEMENTS
var events = require("events");
var dispEvents = new events.EventEmitter();
exports.dispEvents = dispEvents;

// ===================
// FONCTION GENERALES

function setDatas(datas){
	//console.log('Affectation d\'une serie de donnees à la fourmi ' + this.id);
	for(var i in datas){
		//console.log('donnee "'+i+'" : '+datas[i]);
		this.setData(i, datas[i]);
	}
}
function setData(typeData, data){
	switch(typeData){
		case 'clan': this.clan = data; break;
		case 'position': this.position = data; break;
		case 'nom': this.nom = data; break;
		case 'energie': this.energie = data; break;
		case "forcePh": this.forcePh = data; break;
	}
}
function getDatas(){
	var datas = {
		id: this.id,
		clan: this.clan,
		type: this.type,
		position: this.position,
		odorat: this.odorat,
		nom: this.nom,
		etat: this.etat,
		energie: this.energie,
		maxEnergie: this.maxEnergie,
		lapsRun: this.lapsRun
	}
	return datas;
}
function nextRun(intervalReel){
	var timeNR = this.lapsRun;
	if(intervalReel > timeNR){
		timeNR = timeNR + 1000;
	}

	var self = this;
	setTimeout(function(){ self.run();}, timeNR);

}

// ===================
// FONCTION OUTILS

function directionPh(positionF, senteurs, typePh){
	// angle 
	//console.log('Calcul de l\'angle');
	var idPh = getIdSenteurType(typePh, senteurs);
	if(idPh < 0){
		var alea = Math.random() * 3.14 - 1;
		return positionF.sens + alea;
	}

	var xRel = senteurs[idPh].position.x - positionF.x;
	var yRel = senteurs[idPh].position.y - positionF.y;
	var angle = Math.atan2(yRel, xRel);

	//console.log('xRel = ' + xRel + '; yRel = ' + yRel + ' -> angle = ' + angle);

	return angle;
}

//calcul de distance
function distance(x, y){
	var x2 = x * x;
	var y2 = y * y;
	return Math.sqrt(x2 + y2);
}

function getIdSenteurType(typePh, senteurs){
	for(var i in senteurs){
		if(senteurs[i].type == typePh) return i;
	}
	return -1;
}

function cFourmiOuvriere(id, clan, position, pheromones, objets){
	// donnees de construction
	this.id = id;
	this.clan = clan;
	this.position = position;

	this.phs = pheromones;
	this.objs = objets

	// donnees générales de la classe
	this.type = 2;
	this.odorat = 3;
	this.vitesse = 30; // unité/run (500 u/min -> 500/60 u/s -> 500/60 * 3 u/run = 25)
	this.etat = 1;
	this.forcePh = 10;
	this.nom = '0uvriere ' + id;
	this.distanceDetection = 40;

	this.energie = 300;
	this.maxEnergie = 300;
	this.alerteEnergie = this.maxEnergie * 0.7; // alerte à 60 %
	this.consoEnergie = 3; // energie / run

	this.tailleTransport = 10;
	this.typeTransport = 0;
	this.transport = 0;

	this.lapsRun = 3000;
	this.lastRun = Math.round(new Date().getTime() / 1000);
	this.lastPh = 0;

	this.run();
}
cFourmiOuvriere.prototype.getDatas = getDatas;
cFourmiOuvriere.prototype.setData = setData;
cFourmiOuvriere.prototype.setDatas = setDatas;
cFourmiOuvriere.prototype.nextRun = nextRun;
cFourmiOuvriere.prototype.run = function(){
	//console.log();
	//console.log('Run de la fourmi '+this.nom+' ('+this.id+')');
	//console.log('objets :');
	//console.dir(objs);

	if(this.etat == 0) return; // la fourmi est morte
	
	// relations / pheromone
	var phEtat = [0, 1, 1, 2, 3, 4, 0];

	var intervalRun = Math.round(new Date().getTime() / 1000) - this.lastRun;
	this.lastRun = Math.round(new Date().getTime() / 1000);
	var sens = this.position.sens;
	var sensPh = sens;
	var distanceRun = this.vitesse;

	// consommation d'energie
	var consomEnergie = this.consoEnergie;
	this.energie -= consomEnergie;
	//console.log('Energie : '+ this.energie);
	if(this.energie < 0){
		console.log(this.nom + ' est morte !!');
		this.etat = 0;
		dispEvents.emit(this.nom + ' est morte !!');
		dispEvents.emit('killFourmi', this.id);
		return;
	} 

	// détetion de pheromones
	var centreDetect = {
		x: this.position.x + Math.cos(this.position.sens)*this.odorat,
		y: this.position.y + Math.sin(this.position.sens)*this.odorat
	};
	//var senteurs = this.phs.sentirPheromones(centreDetect, this.odorat);
	var senteurs = this.phs.sentirPheromones(this.position, this.odorat);
	// détection objets
	var refsObjets = this.objs.detection(centreDetect, this.distanceDetection);

	// DETERMINER L'ETAT
	this.determineEtat(senteurs);

	// AGIR EN FONCTION DE L'ETAT
	var chercheObjtype = 0;
	switch(this.etat){
		case 1: // exploration
			var sens = directionPh(this.position, senteurs ,1) + 3.14;
			var alea = Math.random() * 2 - 1;
			sens += alea;

			var idPh = getIdSenteurType(1, senteurs);
			if(idPh >= 0 ) sensPh = senteurs[idPh].position.sens + alea;

			// recherche objet ressource
			chercheObjtype = 2;
		break;
		case 2: // aide à la nourriture
			var sens = directionPh(this.position, senteurs ,2);

			var idPh = getIdSenteurType(2, senteurs);
			if(idPh >= 0 ) sensPh = senteurs[idPh].position.sens + Math.PI;


			// recherche objet ressource
			chercheObjtype = 2;
		break;
		case 3: // rapporte de la nourriture
			sens = directionPh(this.position, senteurs ,1);
			var idPh = getIdSenteurType(1, senteurs);
			if(idPh >= 0 ) sensPh = senteurs[idPh].position.sens + Math.PI;

			chercheObjtype = 1;
		break;
		default : // si manque d'energie ou etat inconnu, la fourmi rentre
			sens = directionPh(this.position, senteurs ,1);
			var idPh = getIdSenteurType(1, senteurs);
			if(idPh >= 0 ){
				sensPh = senteurs[idPh].position.sens + Math.PI;
			}
			//console.log('idPh = ' + idPh + ' | sensPh = ' + sensPh);
			chercheObjtype = 1;
	}
	// lissage de trajectoire
	var moyX = Math.cos(sens) + Math.cos(sensPh) + Math.cos(this.position.sens);
	var moyY = Math.sin(sens) + Math.sin(sensPh) + Math.sin(this.position.sens);
	//moyX = moyX /3;
	//moyY = moyY /3;
	var sens = Math.atan2(moyY, moyX);
	//sens = sensPh;
	

	// recherche d'objet
	if(chercheObjtype !=0){
		var dataObjF = this.findObjet(chercheObjtype, refsObjets);
		if(dataObjF != null){

			if(chercheObjtype == 2){
			
				// pour eviter le dépassement de l'objet
				var distObj = distance(this.position.x - dataObjF.position.x, this.position.y - dataObjF.position.y);
				//distObj -= dataObjF.rayon;
				if(distObj < distanceRun) distanceRun = distObj + 1;
			
				// si on cherche une ressource on verifie qu'elle ne soit pas vide
				//console.log('Objet ressource trouve avec une reserce de ' + dataObjF.reserve);
				if(dataObjF.reserve >0) sens = Math.atan2(dataObjF.position.y - this.position.y, dataObjF.position.x - this.position.x);
			}else{
				sens = Math.atan2(dataObjF.position.y - this.position.y, dataObjF.position.x - this.position.x);
			}
		}
	}

	
	// DEPLACEMENT
	if(sens > Math.PI) sens -= Math.PI*2;
	if(sens < -Math.PI) sens += Math.PI*2;
	//console.log('Distance parcourue = '+distanceRun);
	//console.log('angle de la fourmi = '+sens);
	var newX = Math.cos(sens) * distanceRun
	var newY = Math.sin(sens) * distanceRun
	//console.log('Deplacement de ' + newX + ', '+newY);
	newX += this.position.x;
	newY += this.position.y;

	// DETECTION COLLISION
	this.position.sens = sens; // pour pouvoir réagir en fonction quand on rencontre un objet
	for(var j in refsObjets){
		var dataO = refsObjets[j].getDatas();
		var distObj = distance(dataO.position.x - newX, dataO.position.y - newY);
		distObj -= dataO.rayon;

		if(distObj < 0){
			// collision !
			
			if(dataO.type == chercheObjtype){
				// interaction avec l'objet

				distObj *= -1;
				//var reculX = distObj * Math.cos(sens);
				//var reculY = distObj * Math.sin(sens);
				

				switch(chercheObjtype){
					case 1: // cherche fourmiliere
						// la fourmi a atteind la fourmilliere
						//console.log(this.nom+' est arrive a la fourmiliere');
						this.relFourmiliere(refsObjets[j]);
					break;
					case 2: // cherche ressource
						// la fourmi reste en peripherie d'objet
						//newX -= reculX;
						//newY -= reculY;
						// interaction avec l'objet
						this.transport = refsObjets[j].getRessource(this.tailleTransport);
						if(this.transport > 0){
							this.typeTransport = dataO.typeRessource;
							this.etat = 3;
							this.position.sens += Math.PI;
							dispEvents.emit('message', this.transport + ' ressources transportées par '+this.nom);
						}
					break;				
				}
			}else{
				// evitement

			}

			break;
		}
	}
	

	this.position = {x: newX, y: newY, sens: this.position.sens};

	dispEvents.emit('upFourmi', this.getDatas());
	
	// laché de pheromone
	var intervalLastPh = Math.round(new Date().getTime() / 1000) - this.lastPh; // interval en secondes si je ne me suis pas trompé
	//if(intervalLastPh > 4){// initialement 8
		//console.log("lache de pheromone");	
		if(phEtat[this.etat] != 0) this.phs.addPheromone(phEtat[this.etat], this.forcePh, this.position);
		//this.lastPh = Math.round(new Date().getTime() / 1000);
	//}

	// lancment du prochain run
	this.nextRun(intervalRun);

}
cFourmiOuvriere.prototype.determineEtat = function(senteurs){
	// Déterminer l'etat

	// etat en fonction des phs
	var etatPh = [1, 1, 2, 4, 4];// lien ph / etat
	var typePhRetenue = 0;
	if(senteurs.length != 0){
		typePhRetenue = senteurs[senteurs.length - 1].type; // on retien la première car le tableau est sensé être classé de la moins forte à la plus forte
	}
	var newEtat = etatPh[typePhRetenue];

	if(this.etat == 3 && newEtat < 3){
		// si la fourmi est en train de rammener une ressource et qu'il n'y a pas de danger elle continue
		newEtat = this.etat;
	}

	if(this.energie < this.alerteEnergie){
		// si la fourmi manque d'energie, elle rentre quoi qu'il se passe
		newEtat = 6;
		if(this.etat == 3) newEtat = 3; // la fourmi est déjà en train de rentrer
		if(this.etat != 6 && newEtat == 6) this.position.sens = directionPh(this.position, senteurs , 1);// -= 1.57; //  1/4 de demi tour
	}
	this.etat = newEtat;
}
cFourmiOuvriere.prototype.findObjet = function(typeFind, objs){
	for(var i in objs){
		var dataObj = objs[i].getDatas();
		if(dataObj.type == typeFind){
			return dataObj;
		}
	}
	return null;
}
cFourmiOuvriere.prototype.relFourmiliere = function(objFourmil){
	//console.log('Relation avec la fourmiliere :');
	//console.dir(objFourmil);
	if(this.transport > 0){
		// déchargement
		objFourmil.deposerRes(this.typeTransport, this.transport);
		this.transport = 0;
		this.typeTransport = 0;
	}

	// se nourrir
	this.energie = objFourmil.getNourriture(this.maxEnergie);
	
	if(this.etat == 3) this.position.sens += Math.PI;
	this.etat = 1; // on repart
	//this.lastPh = 0;
}


// ======================================
// 		LA reine
// ======================================
function cFourmiReine(id, clan, position, pheromones, objets){
	// donnees de construction
	this.id = id;
	this.clan = clan;
	this.position = position;

	this.phs = pheromones;
	this.objs = objets

	// donnees générales de la classe
	this.type = 1;
	this.odorat = 2;
	this.vitesse = 0; // unité/min
	this.etat = 1;
	this.forcePh = 30;
	this.nom = '0uvriere ' + id;
	this.distanceDetection = 40;

	this.energie = 300;
	this.maxEnergie = 300;
	this.alerteEnergie = this.maxEnergie / 3;
	this.consoEnergie = 1; // enrgie / seconde

	this.lastFourmi = Math.round(new Date().getTime() / 1000);
	this.prodLaps = 5 * 60 * 60; // -> 5 heures

	this.lapsRun = 6000;
	this.lastRun = Math.round(new Date().getTime() / 1000);
	this.lastPh = 0;

	this.nextRun(this.lapsRun);
}
cFourmiReine.prototype.getDatas = getDatas;
cFourmiReine.prototype.setData = function (typeData, data){
	switch(typeData){
		case 'clan': this.clan = data; break;
		case 'position': this.position = data; break;
		case 'nom': this.nom = data; break;
		case 'energie': this.energie = data; break;
		case "forcePh": this.forcePh = data; break;
		case "prodLaps": this.prodLaps = data; break;
	}
}
cFourmiReine.prototype.setDatas = setDatas;
cFourmiReine.prototype.nextRun = nextRun;
cFourmiReine.prototype.run = function(){
	// run de la reine

	// elle tourne
	this.position.sens += 3;
	if(this.position.sens > Math.PI) this.position.sens -= 2 * Math.PI;

	// laché de pheromone
	var intervalLastPh = Math.round(new Date().getTime() / 1000) - this.lastPh; // interval en secondes si je ne me suis pas trompé
	if(intervalLastPh > 300){
		//console.log("lache de pheromone");	
		this.phs.addPheromone(1, this.forcePh, this.position);
		this.lastPh = Math.round(new Date().getTime() / 1000);
	}

	// production de fourmi
	var timeProd = this.lastFourmi + this.prodLaps;

	if(Math.round(new Date().getTime() / 1000) > timeProd){
		// nouvelle fourmi
		//console.log('Nouvelle fourmi !');
		var nF = {
			position: this.position,
			type: 2,
			clan: this.clan
		}
		dispEvents.emit('newFourmi', nF);
		this.lastFourmi = Math.round(new Date().getTime() / 1000);
	}

	dispEvents.emit('upFourmi', this.getDatas());

	// lancment du prochain run
	this.nextRun(Math.round(new Date().getTime() / 1000) - this.lastRun);
}