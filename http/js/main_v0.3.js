/*
	Script JS client principal

	v0.1
		première version
		Utilise canvas sans framwork
*/

// constantes
var txtEtat = ['Morte !', 'En pleine exploration', 'Donne un coup de main', 'Rapporte une ressource', 'A l\'attaque', 'Au secour !', 'J\'ai faim'];
var couleurPheromones = ['rgba(239, 211, 32, 0.3)', 'rgba(20, 178, 11, 0.3)', '#999', '#999', '#999', '#999'];

// stockage des données
var fourmis = [];
var pheromones = [];
var objets = [];

// traces des fourmis
var traces = [];

// Interface
var centreCanvas = {x: 0, y:0};

// Connexion
var socket = io.connect();

// demade des donnees en masse
socket.emit('getPheromones');
socket.emit('getObjets');

// INIT
$(function(){
	window.onresize();
})

// affichage des infos
socket.on('message', function(data){
	console.log('message -> ' + data);

	var msgHTML = $('<div/>');
	setTimeout(function(){
		msgHTML.fadeOut(500, function(){
			$(this).remove();
		});
	}, 5000);
	msgHTML.text(data);
	$('#zone-message').append(msgHTML);
})

// reception des donnees fourmi
socket.on('upFourmi', function(data){
	// MAJ donnees

	var i = 0;
	while(i < fourmis.length){
		if(fourmis[i].id == data.id){
			//console.log('Fourmi trouvée dans la bdd');
			fourmis[i] = data;
			break;
		}else i++;
	}
	if(i == fourmis.length) fourmis.push(data);

	// MAJ grahique
	var blocFourmi = $('#infoF' + data.id);
	if(blocFourmi.length == 0){ // element inexistant
		//console.log('Nouvelle fourmi type '+data.type);
		var TypeF = data.type;
		// création de l'element
		blocFourmi = $('<div id="infoF'+data.id+'"/>');
		blocFourmi.append($('<div/>').addClass('nom'));
		blocFourmi.append($('<div/>').append($('<div/>').addClass('barNRJ')));
		blocFourmi.append($('<div/>').addClass('etat'));
		//blocFourmi.append($('<div/>').addClass('position'));

		$('#fourmis-T'+TypeF).append(blocFourmi);
	}
	$('.nom', blocFourmi).text(data.nom);
	$('.etat', blocFourmi).text(txtEtat[data.etat]);
	//$('.position', blocFourmi).text(data.position.x + ', ' + data.position.y);

	// trace de la fourmi
	if(traces.length < i + 1){
		traces.push([]);
	}
	traces[i].push(data.position);
	if(traces[i].length > 5) traces[i].shift();

});
// reception des donnees pheromone
socket.on('upPheromone', function(dataPh){
	//console.log('Pheromone recue :');
	//console.dir(data);
	if(dataPh.force == 0){
		// pheromone morte
		
		// on recherche la pheromone par son id pour la mettre à jour (normalement c'est la permière)
		var i = 0;
		while(i < pheromones.length){
			if(pheromones[i].id == dataPh.id){
				//console.log('Fourmi trouvée dans la bdd');
				pheromones[i] = dataPh;
				break;
			}
			i++;
		}

		// on vire les premières du tableau si elles son mortes
		while(pheromones[0].force == 0) pheromones.shift();

	}else{
		//ajout
		var i = 0;
		pheromones.push(dataPh);
	}
	
});

// reception des donnees objets
socket.on('upObjet', function(dataObj){
	console.log('Objet reçu');

	var exist = false;
	for(var i in objets){
		if(objets[i].id == dataObj.id){
			objets[i] = dataObj;
			exist = true;
			break;
		}
	}

	// s'in n'existe pas on l'ajoute
	if(!exist){
		objets.push(dataObj);
	}

	
	console.log('Il y a ' + objets.length + ' objets sur la carte');
});
// suppression d'un objet
socket.on('killObjet', function(data){
	for(var i in objets){
		if(objets[i].id == data){
			objets[i].type = 0;
			break;
		}
	}
	
	// tri
	objets.sort(function(a, b){
		if(a.type < b.type) return -1;
		if(a.type > b.type) return 1;
		return 0;
	});
	if(objets[0].type == 0) objets.shift();
	
})

window.onresize=function(){
	$("#canvas").height($(window).height() - 60);
	var canvas = document.getElementById('canvas');
	canvas.width = $('#canvas').width();
	canvas.height = $('#canvas').height();
};

// canvas
function drawCanvas(){
	// récupération du contexte
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	// effacer
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// dessin des objets
	for(var i in objets){
		var phX = objets[i].position.x + canvas.width / 2;
		var phY = objets[i].position.y + canvas.height / 2;
		var phRayon = objets[i].rayon;
		var phCouleur = 'rgb(200, 200, 200)';

		ctx.beginPath(); //On démarre un nouveau tracé.
		ctx.fillStyle = phCouleur;
		ctx.arc(phX, phY, phRayon, 0, Math.PI*2); //On trace la courbe délimitant notre forme
		ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
		ctx.closePath();

		// ajoute le nom
		ctx.font = "10px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de 
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillText(objets[i].nom, phX - objets[i].nom.length * 1.6, phY+2);
		
		if(objets[i].type == 2){
			var txtRessource = objets[i].reserve;
			ctx.fillText(txtRessource, phX, phY+15);
		}
	}

	// dessiner les pheromones
	for(var i in pheromones){
		var phX = pheromones[i].position.x + canvas.width / 2;
		var phY = pheromones[i].position.y + canvas.height / 2;
		var phRayon = pheromones[i].force;
		var phCouleur = couleurPheromones[pheromones[i].type - 1];

		ctx.beginPath(); //On démarre un nouveau tracé.
		ctx.fillStyle = phCouleur;
		ctx.arc(phX, phY, phRayon, 0, Math.PI*2); //On trace la courbe délimitant notre forme
		ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
		ctx.closePath();
	}


	// affichage des traces de passage des fourmis

	for(var i in traces){
		ctx.strokeStyle = 'rgba(86, 55,23,0.5)';
		for(var j = 1; j < traces[i].length; j++){
			ctx.beginPath();
			ctx.moveTo(traces[i][j-1].x + canvas.width / 2, traces[i][j-1].y + canvas.height / 2);
			ctx.lineTo(traces[i][j].x + canvas.width / 2, traces[i][j].y + canvas.height / 2);
			ctx.stroke();
		}
		
	}

	// dessin des fourmis
	for(var i in fourmis){
		var f = fourmis[i];

		//if(f.etat == 0) break;// fourmi mrte, on ne l'affiche pas

		fX = f.position.x + canvas.width / 2;
		fY = f.position.y + canvas.height / 2;

		// zoom auto
		/*if(f.position.x < canvasDecalage.x){
			canvasDecalage.x --;
			canvas.width ++;
			canvas.height ++;
		}
		if(f.position.y < canvasDecalage.y){
			canvasDecalage.y --;
			canvas.width ++;
			canvas.height ++;
		}*/

		// dessin
		// cercle
		ctx.beginPath(); //On démarre un nouveau tracé.
		ctx.fillStyle = "#000";
		ctx.arc(fX, fY, 4, 0, Math.PI*2); //On trace la courbe délimitant notre forme
		ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
		ctx.closePath();

		// ajoute le nom de la fourmi
		ctx.font = "10px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
		ctx.fillText(f.nom, fX + 6, fY+2);//strokeText(); fonctionne aussi, vous vous en doutez.

		// marquage du sens
		var sX = fX + 2*Math.cos(f.position.sens);
		var sY = fY + 2*Math.sin(f.position.sens);
		ctx.beginPath(); //On démarre un nouveau tracé.
		ctx.fillStyle = "#FFF";
		ctx.arc(sX, sY, 2, 0, Math.PI*2); //On trace la courbe délimitant notre forme
		ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
		ctx.closePath();

		
	}
}
setInterval(drawCanvas, 500);
