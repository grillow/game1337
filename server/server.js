import { Player } from '../game/player.js'
import { BulletManager } from '../game/bulletmanager.js'
import { AntiXSS } from './antixss.js'

const bulletManager = new BulletManager()

const express = require('express')
const app = express()
const fs = require('fs')
const credentials = {
    key: fs.readFileSync('/etc/letsencrypt/live/fallrock.net/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/fallrock.net/cert.pem', 'utf8'),
    ca: fs.readFileSync('/etc/letsencrypt/live/fallrock.net/chain.pem', 'utf8')
};
const server = require('https').createServer(credentials, app)

const path = require('path')
const __root = path.resolve(__dirname, '..')
app.use('/', express.static(__root + '/client'))
app.use('/game', express.static(__root + '/game'))

const PORT = process.argv[2]
server.listen(PORT)
console.log(`Server started at ${PORT}`)


const io = require('socket.io')(server, {})
io.sockets.on('connection', function(socket){

    socket.logged = false

    socket.on('ping_latency', function(){
        socket.emit('pong_latency')
    })

    socket.on('disconnect', function(){
        if (!socket.logged)
            return
        console.log(socket.Player.nickname + ' disconnected')
        io.sockets.emit('system_message', socket.Player.safe_nickname + ' disconnected')
        scoreboard_update()
    })
    
    socket.on('login', function(nickname, color){
        if (!(typeof(nickname)=='string') || socket.logged || !/^[^]{1,16}$/.test(nickname) || !(typeof(color)=='string') || !/[0-9A-F]{6}/.test(color)){
            socket.emit('login_failure')
            return
        }
        socket.logged = true
        socket.Player = new Player(socket.id, nickname, AntiXSS.to_safe(nickname))
        socket.Player.color = '#' + color
        socket.Player.respawn()
        scoreboard_update()

        console.log(socket.Player.nickname + ' connected')
        io.sockets.emit('system_message', socket.Player.safe_nickname + ' connected')

        socket.on('message_post', function(message){
            console.log(socket.Player.nickname + ': ' + message)
            if (typeof(message)!='string')
                return
            io.sockets.emit('message_new', socket.Player.safe_nickname, AntiXSS.to_safe(message), socket.Player.color)
        })

        socket.emit('login_success')
    })
    
    socket.on('input', function(dirX, dirY){
        if (!socket.logged)
            return
        if (!socket.Player.isAlive())
            return
        socket.Player.inputX = dirX
        socket.Player.inputY = dirY
    })

    socket.on('mousemove', function(clientX, clientY){
        if (!socket.logged)
            return
        socket.Player.updateMousePosition(clientX, clientY)
    })

    socket.on('+shoot', function(){
        if (!socket.logged)
            return
        socket.Player.toshoot = true
    })
    socket.on('-shoot', function(){
        if (!socket.logged)
            return
        socket.Player.toshoot = false
    })
    
})

setInterval(function(){
    var players = []
    var sockets = io.sockets.sockets
    if (!sockets)
        return;
    for (var id in sockets){
        if (!sockets[id].logged)
            continue
        var player = sockets[id].Player
        if (!player.isAlive())
            continue
        player.updateVelocity()
        player.updatePosition()
        player.updateAmmo()
        player.updateStreak_ticks()
        player.shoot(bulletManager)
        players.push(player)
    }
    bulletManager.update()
    bulletManager.collide(players)
    let sb_update = false
    players.forEach(player => {
        if (player.hit){
            player.hit = false
            if (sockets[player.attacker] && sockets[player.attacker].logged)
                sockets[player.attacker].emit('hit', player.X, player.Y)
        }
        if (!player.isAlive() && !player.deathNotified){
            let victim = sockets[player.id].Player
            if (!sockets[player.attacker]){
                io.sockets.emit('system_message', '&lt;unconnected&gt; killed ' + victim.nickname)
            }
            else{
                let attacker = sockets[player.attacker].Player
                io.sockets.emit('system_message', attacker.safe_nickname + ' killed ' + victim.safe_nickname)
                attacker.updateStreak()
                io.sockets.emit('update_streak', attacker.safe_nickname, attacker.streak)
                attacker.kills++
            }
            sb_update = true
            victim.deaths++
            sockets[player.id].emit('death')
            player.deathNotified = true
            setTimeout(function(){
                player.respawn()
                if (sockets[player.id])
                    sockets[player.id].emit('respawn')
            }, 3000)
        }
    })
    var players_simplified = []
    for (var id in sockets){
        if (!sockets[id].logged)
            continue
        var player = sockets[id].Player
        if (!player.isAlive())
            continue
        players_simplified.push(player.getSimplified())
    }
    io.sockets.emit('gametick', players_simplified, bulletManager.getSimplified())
    
    //update scoreboard
    if (sb_update){
        scoreboard_update()
    }
    
}, 20)

function scoreboard_update(){
    var players = []
    var sockets = io.sockets.sockets
    for (var id in sockets){
        var player = sockets[id].Player
        if (!sockets[id].logged)
            continue
        players.push(player.getSimplifiedScore())
    }
    players.sort((a, b) => a.kills < b.kills)
    players = players.slice(0, 9)
    io.sockets.emit('scoreboard', players)
}
