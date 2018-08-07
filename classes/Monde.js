(function() {
    var util = require('util');
    var events = require('events');
    var Coordinate = require('./Coordinate');
    var Objet = require('./Objet');
    var Fourmi = require('./Fourmi');

    // Define the constructor
    function Monde(nbFourmis, nbObjets, width, height) {
        // Store the message in internal state
        this.nbFourmies = nbFourmis;
        this.nbObjets = nbObjets;

        this.origine = new Coordinate(0,0);

        //La taille
        this.width = width;
        this.height = height;

        //On considère 0 au centre pour les algo de recherche ...
        //donc les max sont inferieur
        this.maxX = width / 2 - 1;
        this.maxY = height / 2 - 1;

        this.objets = [];
        this.objetsCalcules = 0;
        this.grid = {};

        //Contient temporairement les objets crées durant un cycle pour qu'il soient ajoutés à la fin
        this.objetsNouveaux = [];

        for (var x=0; x < width; x++) {
            this.grid[x] = {};
            for (var y=0; y < height; y++) {
                this.grid[x][y] = [];
            }
        }
    };

    util.inherits(Monde, events.EventEmitter);

    // Construit le vivarium
    Monde.prototype.generate = function generate() {
        console.log('Generation du monde');
        this.ajouterObjet(new Fourmi(this, {
            typeFourmi: 'reine',
            name: 'Margo',
            x: 0,
            y: 0
        }));
        for (var i=0; i < this.nbFourmies; i++) {
            this.ajouterObjet(new Fourmi(this, {
                typeFourmi: 'ouvriere',
                name: 'Bob',
                x: 0,
                y: 0
            }));
        }
        for (var i=0; i < this.nbObjets; i++) {
            this.ajouterObjet(new Objet(this, {
                type: 'nourriture',
                name: 'Miel',
                masse: 100
            }));
        }
        this.chargerNouveauxObjets();
    };

    Monde.prototype.ajouterObjet = function ajouterObjet(o) {
        this.objetsNouveaux.push(o);
        this.verifierPosition(o.data.coordinate);
        var c = o.data.coordinate.clone().translate(this.maxX, this.maxY);
        this.grid[c.x][c.y].push(o);
    };

    Monde.prototype.chargerNouveauxObjets = function chargerNouveauxObjets() {
        for (var i=0, tot=this.objetsNouveaux.length; i < tot; i++) {
            this.objets.push(this.objetsNouveaux[i])
        }
        this.objetsNouveaux = [];
    };

    Monde.prototype.be = function be() {
        this.objetsCalcules = 0;
        for (var i=0, tot=this.objets.length; i < tot; i++) {
            if (this.objets[i].data.masse <= 0) {
                //On detruit les objets dont la masse vaut 0
                this.objets[i].destroy();
                delete this.objets[i];
//                console.log('Delete');
                this.done();
            } else {
                this.objets[i].emit('be');
            }
        }
        //Supprime les objets dont la masse est 0
        for (var i=0; i < this.objets.length; i++) {
            if (this.objets[i] == undefined) {
                this.objets.splice(i, 1);
                i--;
            }
        }
    };

    Monde.prototype.done = function done() {
        this.objetsCalcules++;
        if (this.objetsCalcules >= this.objets.length) {
            //Ajoute les nouveaux objets
            this.chargerNouveauxObjets();

            //Cumul les objet cumulables
            this.cummulObjets();

            this.emit('done');
        }
    };


    Monde.prototype.cummulObjets = function cummulObjets() {
        for (var x=0; x < this.width; x++) {
            for (var y=0; y < this.height; y++) {
                var objetsPoint = this.grid[x][y];
                var objetsPointCumules = [];
                for (var i=0, tot=objetsPoint.length; i < tot; i++) {
                    var cumul = false;
                    for (var j=0, t2=objetsPointCumules.length; j < t2; j++) {
                        if (objetsPoint[i].same(objetsPointCumules[j])) {
                            objetsPoint[i].add(objetsPointCumules[j]);
                            objetsPointCumules[j].data.masse = 0;
                            break;
                        }
                    }
                    if (!cumul) {
                        objetsPointCumules.push(objetsPoint[i]);
                    }
                }
                this.grid[x][y] = objetsPointCumules;
            }
        }
    };

    Monde.prototype.verifierPosition = function verifierPosition(position) {
        // Verifier que la destination est dans le cadre
        if (position.x >= this.maxX) {
            position.x = this.maxX;
        } else if (position.x <= -this.maxX) {
            position.x = -this.maxX;
        }
        if (position.y >= this.maxY) {
            position.y = this.maxY;
        } else if (position.y <= -this.maxY) {
            position.y = -this.maxY;
        }
    };

    Monde.prototype.updatePosition = function updatePosition(from, to, objet) {
        this.verifierPosition(to);
        var from = from.clone().translate(this.maxX, this.maxY);
        var to = to.clone().translate(this.maxX, this.maxY);
        var listTo = this.grid[to.x][to.y];
        var listFrom = this.grid[from.x][from.y];
        //Clean le tableau
        for (var i=0; i < listFrom.length; i++) {
            if (listFrom[i].id == objet.id) {
                listFrom.splice(i, 1);
                break;
            }
        }
        listTo.push(objet);
    };

    Monde.prototype.chercherAutour = function updatePosition(from, distance) {
        //retourne les objets dans le rayon
        var objetsAutour = [];
        var c = from.clone().translate(this.maxX, this.maxY);
        var minX = c.x - distance;
        minX = minX < 0 ? 0 : minX;
        var minY = c.y - distance;
        minY = minY < 0 ? 0 : minY;
        var maxX = c.x + distance;
        maxX = (maxX > this.width - 1) ? this.width - 1 : maxX;
        var maxY = c.y + distance;
        maxY = (maxY > this.height - 1) ? this.height - 1 : maxY;
        for (var x=minX; x <= maxX; x++) {
            for (var y=minY; y <= maxY; y++) {
                var objetsPoint = this.grid[x][y];
                for (var i=0, tot=objetsPoint.length; i < tot; i++) {
                    objetsAutour.push(objetsPoint[i]);
                }
            }
        }
        return objetsAutour;
    };

    Monde.prototype.getObjetsData = function getObjetsData() {
        var oData = [];
        for (var i=0, tot=this.objets.length; i < tot; i++) {
            oData.push(this.objets[i].getData())
        }
        return oData;
    };

    Monde.prototype.getRandomCoordinates = function getRandomCoordinates() {
        var coordinate = new Coordinate(Math.random() * this.width - this.maxX, Math.random() * this.height - this.maxY).round();
        return coordinate;
    };

    module.exports = Monde;
}).call(this);