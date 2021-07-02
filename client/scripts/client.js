import { Player } from '/game/player.js'
import { Input } from '/game/input.js'
import { Bullet } from '/game/bullet.js'
import { Hitmarker } from '/game/hitmarker.js'
import { StreakAnnouncer } from '/game/streakannouncer.js'
import { CanvasManager } from '/game/canvasmanager.js'


window.addEventListener('load', function(){
    var GameInput = new Input()
    var Announcer = new StreakAnnouncer()
    var players = []
    var bullets = []
    var hitmarkers = []

    var startTime
    var latency
    
    let canvas = document.getElementById('gameCanvas')
    let context = canvas.getContext('2d')

    canvas.addEventListener('contextmenu', function(event){
        event.preventDefault()
    })

    let socket = io()

    setInterval(function(){
        draw()
        clientUpdate()
    }, 20)

    socket.on('connect', function(){
        document.getElementById('inputWrapper').style.display = 'flex'
        document.getElementById('nicknameInput').focus()
        setInterval(function(){
            startTime = Date.now()
            socket.emit('ping_latency')
        }, 1000)
        socket.on('pong_latency', function(){
            latency = Date.now() - startTime;
            //console.log(latency);
        })
    })

    document.getElementById('inputWrapper').addEventListener('submit', function(event){
        event.preventDefault()
        let nickname = document.getElementById('nicknameInput').value
        if (nickname.trim().length != 0){
            socket.emit('login', nickname, document.getElementById('colorpicker').value)
        }

        socket.on('login_success', function(){
            document.getElementById('inputWrapper').style.display = 'none'
            //activate input
            document.addEventListener('keydown', function(event){
                if (document.activeElement === document.getElementById('messageInput'))
                    return
                GameInput.keydown(event.keyCode)
                sendInput()
            })
            document.addEventListener('keyup', function(event){
                GameInput.keyup(event.keyCode)
                sendInput()
            })
            document.addEventListener('mousemove', function(event){
                socket.emit('mousemove', event.clientX/window.innerWidth, event.clientY/window.innerHeight)  
            })

            document.addEventListener('keypress', function(event){
                if (event.keyCode == 13){
                    document.getElementById('messageInput').focus()
                }
            })

            document.addEventListener('mousedown', function(event){
                if (event.button == 0)
                    socket.emit('+shoot')
            })

            document.addEventListener('mouseup', function(event){
                if (event.button == 0)
                    socket.emit('-shoot')
            })

            socket.on('death', function(){
                document.getElementById('deathScreen').style.display = 'flex'
            })

            socket.on('respawn', function(){
                document.getElementById('deathScreen').style.display = 'none'
            })
        })

        socket.on('login_failure', function(){
            document.getElementById('inputWrapper').style.display = 'flex'
        })
    })

    

    document.getElementById('chatInputWrapper').addEventListener('submit', function(event){
        event.preventDefault()
        let message = document.getElementById('messageInput').value
        if (message.trim().length != 0){
            socket.emit('message_post', message)
            document.getElementById('messageInput').value = ''
        }
        document.getElementById('messageInput').blur()
    })

    socket.on('message_new', function(user, message, color){
        let chat = document.getElementById('history')
        let msg_new = document.createElement('div')
        msg_new.className = 'chat_message'
        msg_new.style.color = color
        msg_new.innerHTML = user + ': ' + message
        chat.appendChild(msg_new)
        chat.scrollTop = chat.scrollHeight
    })

    socket.on('system_message', function(message){
        let chat = document.getElementById('history')
        let msg_new = document.createElement('div')
        msg_new.className = 'system_message'
        msg_new.innerHTML = message
        chat.appendChild(msg_new)
        chat.scrollTop = chat.scrollHeight
    })

    socket.on('update_streak', function(nickname, streak){
        Announcer.announce(streak)
    })

    socket.on('scoreboard', function(players){
        let scoreboard = document.getElementById('top_container')
        scoreboard.innerHTML = ''
        players.forEach(player => {
            let element = document.createElement('div')
            element.className = 'scoreboardItem'
            element.style.color = player.color
            element.innerHTML = player.nickname + ' ' + player.kills + ' / ' + player.deaths
            scoreboard.appendChild(element)
        })
    })

    socket.on('hit', function(X, Y){
        hitmarkers.push(new Hitmarker(X, Y))
    })
    
    function resizeCanvas(){
        //let min = Math.min(window.innerWidth, window.innerHeight)
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        //canvas.width = min
        //canvas.height = min
    }

    function sendInput(){
        socket.emit('input', GameInput.getdirX(), GameInput.getdirY())
    }

    function clientUpdate(){
        players.forEach(function(player){
            Player.prototype.updatePosition.call(player)
        })
        bullets.forEach(function(bullet){
            Bullet.prototype.updatePosition.call(bullet)
        })
    }

    function draw(){
        context.fillStyle = '#000000'
        context.fillRect(0, 0, canvas.width, canvas.height)
        //CanvasManager.drawGrid(canvas)
        players.forEach(function(player){
            Player.prototype.draw.call(player, context, window.innerWidth, window.innerHeight)
        })
        bullets.forEach(function(bullet){
            Bullet.prototype.draw.call(bullet, context, window.innerWidth, window.innerHeight)
        })
        hitmarkers.forEach(function(hitmarker, index, object) {
            hitmarker.play()
            hitmarker.draw(context, canvas.width, canvas.height)
            if (hitmarker.to_die)
                object.splice(index, 1)
        })
    }

    socket.on('gametick', function(p, b){
        players = p
        bullets = b
    })

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    
    setInterval(function(){
        let gamepads = navigator.getGamepads()
        for (let i = 0; i < gamepads.length; i++){
            let gamepad = gamepads[i]
            if (!gamepad)
                continue
            let buttons = gamepad.buttons
            //GameInput.gamepadInput(buttons)
            //sendInput()
            let xAxis = gamepad.axes[0]
            let yAxis = gamepad.axes[1]
            if (Math.abs(xAxis)<0.05)
                xAxis = 0
            if (Math.abs(yAxis)<0.05)
                yAxis = 0
            socket.emit('input', xAxis, yAxis)
        }
    }, 20)
    


})
