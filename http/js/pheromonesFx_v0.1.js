/*
	Classes phéromones coté client

	v0.1
*/

// CLASSE PHEROMONE
function cPheromone(id, type, force, position, duree){
	this.id = id;
	this.type = type;	
	this.force = force;
	this.position = position; // {x, y}
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