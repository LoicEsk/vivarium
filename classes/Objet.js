(function() {
    var Coordinate = require('./Coordinate');
    var Vector = require('./Vector');
    var util = require('util');
    var events = require('events');
    var extend = require('extend');

    var total = 0;

    /**
     * Classe de base pour representer un objet du jeu avec ses caractéristiques de base et sa fonction d'execution
     *
     * @param monde
     * @param data
     * @constructor
     */
    function Objet(monde, data) {
        this.monde = monde;
        this.data = {
            type: 'objet',
            name: 'Bob',
            x: 'rand',
            y: 0,
            masse: 1,
            speed: 0,
            cumulable: false
        };
        this.data = extend(this.data, data);
        if (this.data.x == 'rand') {
            this.data.coordinate = this.monde.getRandomCoordinates();
        } else {
            this.data.coordinate = new Coordinate(this.data.x, this.data.y).round();
        }

        if (!this.data.vector) {
            this.data.vector = Vector.randomUnit().round();
        }

        this.id = total;
        total++;
        this.on('be', this.be.bind(this));
    };

    util.inherits(Objet, events.EventEmitter);

    /**
     * La fonction be represente IA de l'objet elle est executé a chaque itération du jeu sur tous les objets
     *
     * @param game
     */
    Objet.prototype.be = function be() {
//        console.log('Je suis ' + this.data.name + ' ' + this.id + ' (masse:' + this.data.masse + ', x:' + this.data.coordinate.x + ', y:' + this.data.coordinate.y + ')');

        this.monde.done();
    };

    /**
     *
     */
    Objet.prototype.destroy = function destroy() {
    };

    /**
     * Cumule 2 objets
     */
    Objet.prototype.add = function add(b) {
        this.data.masse += b.data.masse;
        return this;
    };

    /**
     * Retourne true si deux objet cumulable
     */
    Objet.prototype.same = function same(b) {
        return (this.data.cumulable && (this.data.type == b.data.type));
    };

    Objet.prototype.distance = function distance(objet) {
        return this.data.coordinate.distance(objet.data.coordinate);
    };

    Objet.prototype.getData = function getData() {
        return this.data;
    };

    module.exports = Objet;
}).call(this);