import { Player } from './player.js'

export class Bullet{
    constructor(owner, X, Y, vX, vY, color)
    {
        this.owner = owner
        this.X = X
        this.Y = Y
        this.vX = vX
        this.vY = vY
        this.color = color
        this.shouldDie = false
    }
    getSimplified(){
        return {'X': this.X, 'Y': this.Y, 'vX': this.vX, 'vY': this.vY, 'color': this.color}
    }
    updatePosition(){
        this.X += this.vX
        this.Y += this.vY
        if (this.X < 0 || this.X > 1 || this.Y < 0 || this.Y > 1){
            this.shouldDie = true
        }
    }
    draw(context, w, h){
        context.fillStyle = this.color
        context.beginPath()
        //context.arc(this.X*w, this.Y*h, this.radius*Math.min(w,h), 0, 2 * Math.PI, false)
        context.ellipse(this.X*w, this.Y*h, Bullet.radius*w, Bullet.radius*h, 0, 0, 2*Math.PI)
        context.fill()
    }
    collide(players){
        players.forEach(player => {
            let dx = player.X - this.X
            let dy = player.Y - this.Y
            let mag2 = dx*dx + dy*dy
            if (mag2 < (Bullet.radius + Player.radius)*(Bullet.radius + Player.radius) && this.owner != player.id){
                if (player.takeDamage(1, this.owner)){
                    //this.shouldDie = true
                }
            }
        })
    }
}

Bullet.radius = 0.002
