(function($) {
    // Define the constructor
    function DisplayCanvas(selector) {
        //Objet jquery
        this.$canvas = $(selector);
        //objet canva natif
        this.canvas = this.$canvas[0];

        var self = this;
        $(window).on('resize', function() {
            self.$canvas.height($(this).height() - 60);
            self.canvas.width = self.$canvas.width();
            self.canvas.height = self.$canvas.height();
        });
        $(window).trigger('resize');
    };

    DisplayCanvas.prototype.render = function render(data) {
        var ctx = this.canvas.getContext('2d');
        // effacer
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (var i=0, tot=data.length; i < tot; i++) {
            var o = data[i];
            if (o.type == 'fourmi') {
                this.renderFourmi(o);
            }
            if (o.type == 'pheromone') {
                this.renderPheromone(o);
            }
            if (o.type == 'nourriture') {
                this.renderNourriture(o);
            }
        }
    };

    DisplayCanvas.prototype.getCanvaCoordinates = function getCanvaCoordinates(o) {
        return {
            x: o.coordinate.x + canvas.width / 2,
            y: o.coordinate.y + canvas.height / 2
        };
    };

    DisplayCanvas.prototype.renderPheromone = function renderPheromone(o) {

        var ctx = this.canvas.getContext('2d');
        var c = this.getCanvaCoordinates(o);
        var rayon = o.masse / 10;
//        var phCouleur = couleurPheromones[pheromones[i].type - 1];

        ctx.beginPath(); //On démarre un nouveau tracé.
        if (o.typePheromone == 'nourriture') {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        } else {
            ctx.fillStyle = 'rgba(239, 211, 32, 0.3)';
        }
        ctx.arc(c.x, c.y, rayon, 0, Math.PI*2); //On trace la courbe délimitant notre forme
        ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
        ctx.closePath();
    };

    DisplayCanvas.prototype.renderNourriture = function renderNourriture(o) {
        var ctx = this.canvas.getContext('2d');
        var c = this.getCanvaCoordinates(o);
        var rayon = o.masse / 10;
//        var phCouleur = couleurPheromones[pheromones[i].type - 1];

        ctx.beginPath(); //On démarre un nouveau tracé.
        ctx.fillStyle = 'green';
        ctx.arc(c.x, c.y, rayon, 0, Math.PI*2); //On trace la courbe délimitant notre forme
        ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
        ctx.closePath();
        // ajoute le nom de la fourmi
        ctx.font = "10px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
        ctx.fillText(o.name + '(' + o.masse + ')', c.x - 6, c.y + rayon + 6);//strokeText(); fonctionne aussi, vous vous en doutez.
    };

    DisplayCanvas.prototype.renderFourmi = function renderFourmi(o) {
        var ctx = this.canvas.getContext('2d');
        var fX = o.coordinate.x + canvas.width / 2;
        var fY = o.coordinate.y + canvas.height / 2;

        // dessin
        // cercle
        ctx.beginPath(); //On démarre un nouveau tracé.
        if (o.typeFourmi == 'reine') {
            console.log('reine');
            ctx.fillStyle = '#000000';
            ctx.arc(fX, fY, 10, 0, Math.PI*2); //On trace la courbe délimitant notre forme
        } else {
            if (o.status == 'fatigue') {
                ctx.fillStyle = '#FF0000';
            } else {
                ctx.fillStyle = '#000000';
            }
            ctx.arc(fX, fY, 4, 0, Math.PI*2); //On trace la courbe délimitant notre forme
        }
        ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
        ctx.closePath();

        // ajoute le nom de la fourmi
        ctx.font = "10px Helvetica";//On passe à l'attribut "font" de l'objet context une simple chaîne de caractères composé de la taille de la police, puis de son nom.
        ctx.fillText(o.name, fX + 6, fY+2);//strokeText(); fonctionne aussi, vous vous en doutez.

        // marquage du sens
        var sX = fX + o.vector.x;
        var sY = fY + o.vector.y;
        ctx.beginPath(); //On démarre un nouveau tracé.
        ctx.fillStyle = "#FFF";
        ctx.arc(sX, sY, 2, 0, Math.PI*2); //On trace la courbe délimitant notre forme
        ctx.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
        ctx.closePath();
    };

    vivarium.DisplayCanvas = DisplayCanvas;
})(jQuery);