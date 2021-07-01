export class Hitmarker{
    constructor(X, Y){
        this.X = X
        this.Y = Y
        this.duration = 5
        this.image = new Image()
        this.image.src = '/img/hitmarker_40.png'
        this.sound = new Audio('/audio/hitmarker.mp3')
        this.to_play = true
        this.ticks = 0
        this.to_die = false
    }
    play(){
        if (this.to_play)
            this.sound.play()
        this.to_play = false
    }
    draw(context, w, h){
        if (this.ticks < this.duration)
            context.drawImage(this.image, this.X*w-this.image.width/2, this.Y*h-this.image.height/2)
        else
            this.to_die = true
        this.ticks++
    }
}