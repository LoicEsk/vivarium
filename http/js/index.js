/**
 * Created by draganshadow on 21/05/14.
 */
$(document).ready(function() {
    var gss = new vivarium.GameServerSocket();
    var display = new vivarium.DisplayCanvas('#canvas');

    //Faire quelquechose des données reçues
    gss.setPushObjetsListener(function(data){
        display.render(data);
    });

    $('.refresh').on('click', function() {
        gss.getObjets();
    });
    setInterval(function () {
        gss.getObjets();
    }, 1000);
});