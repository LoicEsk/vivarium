(function() {
    var util = require('util');
    var events = require('events');
    var extend = require('extend');
    var Objet = require('./Objet');

    // Define the constructor
    function Pheromone(monde, data) {
        this.data = {
            type: 'pheromone',
            typePheromone: 'cherche',
            masse: 50,
            cumulable: true
        };
        this.data = extend(this.data, data);
        Pheromone.super_.call(this, monde, this.data);
    };

    util.inherits(Pheromone, Objet);

    /**
     * L'IA de la phéromone :-)
     * @param game
     */
    Pheromone.prototype.be = function be(game) {
        //La pheromone s'evapore elle sera suprimée au prochain cycle
        this.data.masse--;
        this.monde.done();
    };

    /**
     * Retourne true si deux objet cumulable
     */
    Pheromone.prototype.same = function same(b) {
        return (this.data.type == b.data.type &&
                this.data.typePheromone == b.data.typePheromone);
    };


    module.exports = Pheromone;
}).call(this);