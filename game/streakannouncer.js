export class StreakAnnouncer{
    constructor(){
        this.volume = 0.25
        this.double_kill = new Audio('/audio/double_kill.mp3'); this.double_kill.volume = this.volume
        this.triple_kill = new Audio('/audio/triple_kill.mp3'); this.triple_kill.volume = this.volume
        this.ultra_kill = new Audio('/audio/ultra_kill.mp3'); this.ultra_kill.volume = this.volume
        this.rampage = new Audio('/audio/rampage.mp3'); this.rampage.volume = this.volume
    }
    announce(streak){
        switch(streak){
            case 1: break;
            case 2: this.double_kill.play(); break
            case 3: this.triple_kill.play(); break
            case 4: this.ultra_kill.play(); break
            case 5: this.rampage.play(); break
            default: //this.rampage.play(); break
        }
    }
}