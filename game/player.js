import { Bullet } from './bullet.js'

export class Player{
    constructor(id, nickname, safe_nickname){
        this.id = id
        this.nickname = nickname
        this.safe_nickname = safe_nickname
        this.X = 0.5
        this.Y = 0.5
        this.vX = 0
        this.vY = 0
        this.mX = 0.5
        this.mY = 0.5
        this.inputX = 0
        this.inputY = 0
        this.health = 1
        this.kills = 0
        this.deaths = 0
        this.deathNotified = false
        this.attacker = ''
        this.hit = false
        this.toshoot = false
        this.ammo = Player.maxAmmo
        this.ammo_ticks = 0
        this.streak = 0
        this.streak_ticks = 0
        this.color = '#000000'
    }
    getSimplified(){
        return {'nickname': this.nickname, 'X': this.X, 'Y': this.Y, 'vX': this.vX, 'vY': this.vY, 'mX': this.mX, 'mY': this.mY, 'ammo': this.ammo, 'color': this.color}
    }
    getSimplifiedScore(){
        return {'nickname': this.safe_nickname, 'kills': this.kills, 'deaths': this.deaths, 'color': this.color}
    }
    respawn(){
        this.health = 1
        this.streak = 0
        this.streak_ticks = 0
        this.ammo = Player.maxAmmo
        this.deathNotified = false
        this.attacker = ''
        this.hit = false
        this.X = Math.random()
        this.Y = Math.random()        
        this.vX = 0
        this.vY = 0
        this.inputX = 0
        this.inputY = 0
    }
    isAlive(){
        return (this.health>0)
    }
    getLookDirection(){
        let dx = this.mX - this.X
        let dy = this.mY - this.Y
        let mag = Math.sqrt(dx*dx + dy*dy)
        if (mag > 0){
            dx /= mag
            dy /= mag
        }
        return {dx, dy}
    }

    updateMousePosition(mX, mY){
        this.mX = mX
        this.mY = mY
    }
    draw(context, w, h){
        context.globalAlpha = 0.25
        context.strokeStyle = this.color
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(this.X*w, this.Y*h)
        context.lineTo(this.mX*w, this.mY*h)
        context.stroke()   
        context.globalAlpha = 1

        context.strokeStyle = this.color
        context.lineWidth = 2
        context.beginPath()
        let look = Player.prototype.getLookDirection.call(this)
        context.moveTo(this.X*w, this.Y*h)
        context.lineTo((this.X + look.dx/25)*w, (this.Y + look.dy/25)*h)
        context.stroke()        

        context.fillStyle = this.color
        context.beginPath()
        //context.arc(this.X*w, this.Y*h, this.radius*Math.min(w,h), 0, 2 * Math.PI, false)
        context.ellipse(this.X*w, this.Y*h, Player.radius*w, Player.radius*h, 0, 0, 2*Math.PI)
        context.fill()

        context.globalAlpha = 0.75
        context.fillStyle = this.color
        context.font = "1.5vh Geneva"
        context.textAlign = 'center'
        context.fillText('[' + this.ammo + ']' + this.nickname, this.X*w, this.Y*h - 14)
        context.globalAlpha = 1
    }
    updateVelocity(){        
        let vX = this.inputX
        let vY = this.inputY
        let mag = Math.sqrt(this.inputX*this.inputX + this.inputY*this.inputY)
        if (mag > 1){
            vX /= mag
            vY /= mag
        }
        this.vX = vX * Player.maxSpeed
        this.vY = vY * Player.maxSpeed
    }
    updatePosition(){
        this.X += this.vX
        this.Y += this.vY
        if (this.X < 0)
            this.X = 0
        if (this.X > 1)
            this.X = 1
        if (this.Y < 0)
            this.Y = 0
        if (this.Y > 1)
            this.Y = 1
    }
    shoot(bulletmanager){
        if (!this.toshoot || this.ammo <= 0)
            return
        let look = this.getLookDirection()
        if (look.dx == 0 && look.dy == 0)
            return
        bulletmanager.add(new Bullet(this.id, this.X, this.Y, look.dx/100, look.dy/100, this.color))
        this.ammo--
    }
    updateAmmo(){
        this.ammo_ticks++
        if (this.ammo_ticks > 10)
            this.ammo_ticks = 10
        if (this.ammo_ticks >= 10 && this.ammo < Player.maxAmmo){
            this.ammo_ticks = 0
            this.ammo++
        }
        
    }
    updateStreak(){
        this.streak++
        this.streak_ticks = 100
    }
    updateStreak_ticks(){
        if (this.streak_ticks <= 0)
            return
        this.streak_ticks--
        if (this.streak_ticks <= 0){
            this.streak = 0
            this.streak_ticks = 0
        }
    }
    takeDamage(damage, attacker){
        if (this.health <= 0)
            return false
        this.hit = true
        this.attacker = attacker //turn it to array because if a player receives damage from 2 different players in one tick...
        this.health -= damage
        return true
    }
}

Player.radius = 0.007
Player.maxAmmo = 20
Player.maxSpeed = 0.005
