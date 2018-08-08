#!/usr/bin/env node

/*
	Script de lancement du vivarium
    vession 0.1
*/

console.log("_____________________");
console.log("Lancement du vivarium");
console.log("http sur port 8080");
console.log("ctrl+C pour arreter");

var fs = require('fs');

// LE MOTEUR DE JEU
var core = require('./core_v0.4');

// LE SERVEUR HTTP
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/http'));

/*.use(function(req, res, next){
	// 404
    res.setHeader('Content-Type', 'text/plain');
    res.send(404, 'Page introuvable !');
});*/

var server = app.listen(8080);

// Chargement de socket.io
var io = require('socket.io').listen(server, { log: false });//
// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté à socket.io');
    socket.emit('message', 'Un client est connecté à socket.io');

    // reception
    socket.on('getPheromones', function(){
        core.sentPheromones();
    });
    socket.on('getObjets', function(){
        core.sentObjets();
    });

    // emmission des evements du moteur
    core.coreEvents.on("message", function(data){
        socket.emit('message', data);
    });
    core.coreEvents.on("upFourmi", function(data){
        socket.emit('upFourmi', data);
    });
    core.coreEvents.on("upPheromone", function(data){
        //console.log('upPheromone sur index.js');
        socket.emit('upPheromone', data);
        // a filtrer en fonction du clan
    });
    core.coreEvents.on("upObjet", function(data){
        socket.emit('upObjet', data);
        // a filtrer en fonction du clan
    });

    // connexion coupee
    socket.on('disconnect', function(){
        console.log('Un client s\'est déconnecté.');
        // sauvegarde
    })

});

// test des evements
