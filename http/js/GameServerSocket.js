(function($) {
    // Define the constructor
    function GameServerSocket() {
        // Store the message in internal state
        this.socket = io.connect();
        this.socket.on('message', this.message);
        //Pour les debug
        this.socket.on('pushObjets', function(data){
            console.log('Objet reçu');
            console.dir(data);
        });
    };

    GameServerSocket.prototype.message = function message(data) {
        console.log('message -> ' + data);
        var msgHTML = $('<div/>');
        setTimeout(function(){
            msgHTML.fadeOut(500, function(){
                $(this).remove();
            });
        }, 5000);
        msgHTML.text(data);
        $('#zone-message').append(msgHTML);
    };

    GameServerSocket.prototype.getObjets = function getObjets() {
        // demade de tous les objets
        this.socket.emit('getObjets');
    };

    GameServerSocket.prototype.setPushObjetsListener = function setPushObjetsListener(callback) {
        // reception des donnees objets
        this.socket.on('pushObjets', callback);
    };

    vivarium.GameServerSocket = GameServerSocket;
})(jQuery);