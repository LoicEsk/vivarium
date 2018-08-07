(function() {
    var util = require('util');
    var Coordinate = require('./Coordinate');
    var Vector = require('./Vector');
    var events = require('events');
    var extend = require('extend');
    var Objet = require('./Objet');
    var Pheromone = require('./Pheromone');

    /**
     * Debug pour suivre la première fourmi qui trouve de la nouriture
     * @type {boolean}
     */
    var suivreUne = false;

    // Define the constructor
    function Fourmi(monde, data) {
        this.data = {
            type: 'fourmi',
            typeFourmi: 'ouvriere',
            status: 'cherche',
            odorat: 22,
            speed: 5,
            maxSpeed: 5,
            energie: 500,
            seuilEnergie: 250,
            maxEnergie: 500,
            charge: 0,
            suivre: false,
            objectif: false
        };
        this.data = extend(this.data, data);
        Fourmi.super_.call(this, monde, this.data);
    };

    util.inherits(Fourmi, Objet);

    /**
     * L'IA de la fourmi
     * @param game
     */
    Fourmi.prototype.be = function be() {
        if (this.data.typeFourmi == 'ouvriere') {
            this.beOuvriere();
        }
        if (this.data.typeFourmi == 'reine') {
            this.beReine();
        }
        this.monde.done();
    };

    /**
     * L'IA de la fourmi reine
     * @param game
     */
    Fourmi.prototype.beReine = function beReine() {
//        console.log('Je suis Reine ' + this.data.name + ' ' + this.id + ' (masse:' + this.data.masse + ', x:' + this.data.coordinate.x + ', y:' + this.data.coordinate.y + ')');
    };

    /**
     * L'IA de la fourmi ouvrière
     * @param game
     */
    Fourmi.prototype.beOuvriere = function beOuvriere() {
        this.data.energie--;
//        console.log('Je suis Fourmi ' + this.data.name + ' ' + this.id + ' (x:' + this.data.coordinate.x + ', y:' + this.data.coordinate.y + ')');

        //Si objectif atteint on supprime l'objectif
        if (this.data.objectif && Coordinate.equals(this.data.coordinate, this.data.objectif)) {
            this.data.objectif = false;
        }

        //Si on est au centre (a changer plus tard pour "dans la fourmilierre)
        if (Coordinate.equals(this.data.coordinate, this.monde.origine)) {
            this.data.energie = this.data.maxEnergie;
            this.data.status = 'cherche';
        }
        //On prend une direction legèrement differente dans les 90° devant
        //this.data.vector.rotate((Math.random() * Math.PI / 2) - Math.PI / 4);

        //Fourmi fatigue
        if (!this.data.objectif) {
            if (this.data.energie < this.data.seuilEnergie) {
                this.data.objectif = this.monde.origine.clone();
                this.data.status = 'fatigue';
            }
            var objetsAutour = this.monde.chercherAutour(this.data.coordinate, this.data.odorat);
            for (var i=0, tot=objetsAutour.length; i < tot; i++) {
                if (objetsAutour[i].data.type == 'nourriture' && objetsAutour[i].data.masse > 0) {
                    objetsAutour[i].data.masse -= 10;
                    console.log('NOURRITURE ' + objetsAutour[i].id + ' masse:' + objetsAutour[i].data.masse);
                    this.data.status = 'nourriture';
                    this.data.objectif = this.monde.origine.clone();
                    if (!suivreUne) {
                        this.data.suivre = true;
                        suivreUne = true;
                    }
                    break;
                }
            }
        
            // synthétisation des phéromones
            var synthesePh = {}; // objet de calcul des phéromones de synthèses
            for (var i=0, tot=objetsAutour.length; i < tot; i++) {
                
                if (objetsAutour[i].data.type == 'pheromone' && objetsAutour[i].data.masse > 0) {
                    
                    // IA Fourmi

                    var ph = objetsAutour[i];
                    if(ph.data.coordinate.x != 0 && ph.data.coordinate.y != 0){

                        // création de la phéromone de synthèse si elle n'existe pas
                        if(synthesePh[ph.data.typePheromone] == undefined){
                            synthesePh[ph.data.typePheromone] = {
                                coordinate : new Vector(0, 0),
                                vector : new Vector(0, 0),
                                masse : 0
                            }
                        }

                        var directionToP = Vector.difference(ph.data.coordinate, this.data.coordinate);
                        var distance = directionToP.magnitude();
                        if(distance == 0) distance = 1;
                        var force = ph.data.masse / distance;
                        var phCoordinate = ph.data.coordinate.clone();
                        var phVector = ph.data.vector.clone();

                        // position pondérée
                        synthesePh[ph.data.typePheromone].coordinate.scale(synthesePh[ph.data.typePheromone].masse);
                        phCoordinate.scale(force);
                        synthesePh[ph.data.typePheromone].coordinate.add(phCoordinate);
                        synthesePh[ph.data.typePheromone].coordinate.scale(1 / (force + synthesePh[ph.data.typePheromone].masse));
                        
                        // sens pondéré
                        synthesePh[ph.data.typePheromone].vector.scale(synthesePh[ph.data.typePheromone].masse);
                        phVector.scale(force);
                        synthesePh[ph.data.typePheromone].vector.add(phVector);
                        synthesePh[ph.data.typePheromone].vector.scale(1 / (force + synthesePh[ph.data.typePheromone].masse));

                        // masse totale
                        synthesePh[ph.data.typePheromone].masse += ph.data.masse;
                    }

                    /*if(ph.data.typePheromone == 'nourriture' &&
                        ph.data.coordinate.x != 0 &&
                        ph.data.coordinate.y != 0
                        ) {
                        var directionToP = Vector.directionFromTo(this.data.coordinate, ph.data.coordinate);
                        var originP = ph.data.vector.clone().invert();
                        this.data.vector = Vector.sum(directionToP, originP);
                        if (this.data.vector.x == 0 && this.data.vector.y == 0) {
                            this.data.vector = originP;
                        }
                        this.data.vector.normalize();
                    }
                    break;*/

                }
            }
            // un fois le phérmones synthétisés, la fourmi prend sa décision
            var decision = 'exploration';
            if(synthesePh["nourriture"] != undefined){
                decision = 'aideNourriture';
            }

//            console.log('Decision de la fourmi : %s', decision);

            // elle agit en fonction de la décision
            switch(decision){
                case 'exploration' :
                    // en ballade
                    if(synthesePh['exploration'] == undefined){
                        // pas de pheromone exploration à porté d'antenne
                        var direction = Vector.random();
                        direction.add(this.data.vector);
                    }else{
                        var direction = Vector.directionFromTo(this.data.coordinate, synthesePh['exploration'].coordinate);
                        direction.rotate(Math.PI + Math.random() * 2 - 1);
                        direction.add(synthesePh['exploration'].vector);
                    }
                    this.data.vector = direction.normalize().clone();
                break;

                case 'aideNourriture' :
                    // on suit la piste nourriture
//                    console.log('Posiotion fourmi : %d x %d', this.data.coordinate.x, this.data.coordinate.y);
//                    console.log('Posiotion pheromone : %d x %d', synthesePh['nourriture'].coordinate.x, synthesePh['nourriture'].coordinate.y);
                    var direction = Vector.directionFromTo(this.data.coordinate, synthesePh['nourriture'].coordinate);
                    //direction.add(synthesePh['nourriture'].vector.invert());
                    //direction.add(this.data.vector);
                    this.data.vector = direction.normalize().clone();
//                    console.log('(aide nouriture) Direction : %d x %d', direction.x, direction.y);
                break;

                default :
                    // retour à la fourmilière
                    if(synthesePh['exploration'] == undefined){
                        var direction = Vector.directionFromTo(this.data.coordinate, this.monde.origine);
                    }else{
                        var direction = Vector.directionFromTo(this.data.coordinate, synthesePh['exploration'].coordinate);
                        direction.add(synthesePh['exploration'].vector.invert());
                        direction.add(this.data.vector);
                        direction.add(Vector.directionFromTo(this.data.coordinate, this.monde.origine)); // la position de la fourmiliere fait maintenant partir de la direction de retour
                        this.data.vector = directionPh.normalize().clone();
                    }
                break;
            }
            
        } else {
            // aller à l'objectif
            this.data.vector = Vector.directionFromTo(this.data.coordinate, this.data.objectif);
        }

        if (this.data.suivre) {
            console.log(this.data.status);
//            console.log(this.data.coordinate);
//            console.log(this.data.vector);
        }

//        console.log('Etat de la fourmi : %s. Direction %d x %d', this.data.status, this.data.vector.x, this.data.vector.y);

        this.poserPheromone();

        this.move();

        //Permet de suprimer les autre fourmi et suivre juste une
//        if (suivreUne && !this.data.suivre) {
//            this.data.masse = 0;
//        }
    };

    /**
     * Calcule le mouvement
     */
    Fourmi.prototype.move = function move() {
        var previousCoordinate = this.data.coordinate.clone();

        //Si on peut atteindre l'objectif on y va
        if (this.data.objectif && (Coordinate.distance(this.data.coordinate, this.data.objectif) <= this.data.speed)) {
            this.data.coordinate = this.data.objectif.clone();
        } else {
            //Sinon on avance
            //TODO calculer correctement
            var mouvement = this.data.vector.clone();
            mouvement.x = mouvement.x * this.data.speed;
            mouvement.y = mouvement.y * this.data.speed;
            this.data.coordinate = Coordinate.sum(this.data.coordinate, mouvement).round();
        }
        this.monde.updatePosition(previousCoordinate, this.data.coordinate, this);
    };

    /**
     * Depose pheromone
     */
    Fourmi.prototype.poserPheromone = function poserPheromone() {
        if (this.data.status == 'nourriture') {
            this.monde.ajouterObjet(new Pheromone(this.monde, {
                typePheromone: this.data.status,
                x: this.data.coordinate.x,
                y: this.data.coordinate.y,
                masse: 50,
                vector: this.data.vector.clone()
            }));
        }
    };

    module.exports = Fourmi;
}).call(this);