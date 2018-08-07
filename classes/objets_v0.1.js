/* 	=================================
		GESTION DES OBJETS
	=================================

	v0.1
		Première verion
		Apparait avec le v0.3 de CORE
*/

exports.cObjets = cObjets;
//exports.cFourmiliere = cFourmiliere;
//exports.cObjetRessource = cObjetRessource;

// EVENEMENTS
var events = require("events");
var dispEvents = new events.EventEmitter();
exports.dispEvents = dispEvents;


// classe de gestion des objets
function cObjets(){
	// constructeur
	console.log('constructeur de cObjets');
	this.data = [];
	this.nextID = 0;
}
cObjets.prototype.add = function(typeO, position){
	console.log('Creation d\'un objet de type ' + typeO);

	switch(typeO){
		case 1: // fourmiliere
			var newObj = new cFourmiliere(this.nextID, position);
		break;
		case 2: // nourriture
			var newObj = new cObjetRessource(this.nextID, position);
			
		break;
		default:
			console.log('ERREUR : Objet non reconnu');
			return null;
	}
	
	// envoi des infos
	dispEvents.emit('upObjet', newObj.getDatas());

	this.nextID ++;
	this.data.push(newObj);
	return newObj;
}

cObjets.prototype.detection = function(positionF, distanceDetect){
	//console.log('positionF : ');
	//console.dir(positionF);
	var refObjs = [];
	for(var i in this.data){
		var dataO = this.data[i].getDatas();
		//console.log('donnes de l\'objet :');
		//console.dir(dataO);
		var dist = distance(positionF.x, positionF.y, dataO.position.x, dataO.position.y);
		dist -= dataO.rayon;
		//console.log('Objet à ' + dist);
		if(dist < distanceDetect){
			refObjs.push(this.data[i]);
		}
	}
	return refObjs;
}
cObjets.prototype.upAll = function(){
	for(var i in this.data){
		var dataObj = this.data[i].getDatas();
		dispEvents.emit('upObjet', dataObj);
	}
}


// ===================
// FONCTION GENERALES

function setDatas(datas){
	//console.log('Affectation d\'une serie de donnees à l\'objet ' + this.id);
	for(var i in datas){
		//console.log('donnee "'+i+'" : '+datas[i]);
		this.setData(i, datas[i]);
	}
}

// ===============================
// CLASSE FOURMILIERE
function cFourmiliere(id, position){
	this.id = id;
	this.position;

	this.type = 1;
	this.rayon = 30;
	this.nom = 'Fourmiliere';

	this.clan = 0; // a charger via setData
	this.ressources = [];

}
cFourmiliere.prototype.getDatas = function (){
	var datas = {
		id: this.id,
		type: this.type,
		position: this.position,
		nom: this.nom,
		rayon: this.rayon,
	}
	return datas;
}
cFourmiliere.prototype.setData = function (typeData, data){
	switch(typeData){
		case 'clan': this.clan = data; break;
		case 'position': this.position = data; break;
		case 'nom': this.nom = data; break;
		case 'rayon': this.rayon = data; break;
	}
}
cFourmiliere.prototype.setDatas = setDatas;
cFourmiliere.prototype.deposerRes = function(typeRes, quantite){
	//console.log('Depot impossible dans la fourmiliere. Ressources perdus !');
}
cFourmiliere.prototype.getNourriture = function(quantite){
	//console.log('Nourriture abondante, fourmi servie.');
	//dispEvents.emit('message', quantite + ' de nourriture servie à une fourmi.');
	return quantite;
}

// ===================================================
// CLASSE POUR LES RESSOURCES : nourritures, materiaux
function cObjetRessource(id, position){
	this.id = id;
	this.position = position;

	this.type = 2;
	this.rayon = 10;
	this.nom = 'Feuille';

	this.typeRessource = 1; // végétaux
	this.reserve = 500;

	this.intervalRun = 0;
	this.apport = 0;
}
cObjetRessource.prototype.getDatas = function (){
	var datas = {
		id: this.id,
		type: this.type,
		position: this.position,
		nom: this.nom,
		rayon: this.rayon,
		typeRessource: this.typeRessource,
		reserve: this.reserve,
		intervalRun: this.intervalRun,
		apport: this.apport
	}
	return datas;
}
cObjetRessource.prototype.setData = function (typeData, data){
	switch(typeData){
		case 'clan': this.clan = data; break;
		case 'position': this.position = data; break;
		case 'nom': this.nom = data; break;
		case 'rayon': this.rayon = data; break;
		case 'reserve' : this.reserve = data; break;
		case 'intervalRun': this.intervalRun = data; this.runInterval(); break;
		case 'apport': this.apport = data; break;
	}
}
cObjetRessource.prototype.setDatas = setDatas;
cObjetRessource.prototype.getRessource = function(quantite){
	//console.log('Une fourmi demande ' + quantite + ' ressources');
	var fournie = 0;
	if(quantite < this.reserve){
		fournie = quantite;
	}else{
		fournie = this.reserve;
	}
	this.reserve -= fournie;
	//console.log(fournie + ' ressource de type ' + this.typeRessource + ' donnee.');
	//console.log(this.reserve + ' ressources restantes.');

	// envoi des infos
	dispEvents.emit('upObjet', this.getDatas());

	return fournie;
}
cObjetRessource.prototype.runInterval = function(){
	
	this.reserve += this.apport;
	console.log('Réapprovisionnement de '  + this.nom + ' -> ' + this.reserve + ' en stock');
	var self = this;

	// envoi des infos
	dispEvents.emit('upObjet', this.getDatas());

	if(this.intervalRun > 0){
		setTimeout(function(){ self.runInterval(); }, this.intervalRun * 1000);
	}
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