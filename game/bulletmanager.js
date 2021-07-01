import { Bullet } from './bullet.js'

export class BulletManager{
    constructor(){
        this.bullets = []
    }
    getSimplified(){
        var bullets_simplified = []
        this.bullets.forEach(function(bullet){
            bullets_simplified.push(bullet.getSimplified())
        })
        return bullets_simplified
    }    
    add(bullet){
        this.bullets.push(bullet)
    }
    update(){
        this.bullets.forEach(function(bullet, index, object){
            Bullet.prototype.updatePosition.call(bullet)
            if (bullet.shouldDie)
                object.splice(index, 1)
        })
    }
    collide(players){
        this.bullets.forEach(function(bullet, index, object){
            bullet.collide(players)
            if (bullet.shouldDie)
                object.splice(index, 1)
        })
    }
}