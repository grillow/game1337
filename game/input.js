export class Input{
    constructor(){
        this.left = false
        this.right = false
        this.up = false
        this.down = false
    }
    keydown(keyCode){
        if (keyCode == 65)
            this.left = true
        if (keyCode == 68)
            this.right = true
        if (keyCode == 87)
            this.up = true
        if (keyCode == 83)
            this.down = true
    }
    keyup(keyCode){
        if (keyCode == 65)
            this.left = false
        if (keyCode == 68)
            this.right = false
        if (keyCode == 87)
            this.up = false
        if (keyCode == 83)
            this.down = false
    }
    gamepadInput(buttons){
        this.left = buttons[14].pressed
        this.right = buttons[15].pressed
        this.up = buttons[12].pressed
        this.down = buttons[13].pressed
    }
    getdirX(){
        if (this.left && !this.right)
            return -1
        else if (!this.left && this.right)
            return 1
        else
            return 0
    }
    getdirY(){
        if (this.up && !this.down)
            return -1
        else if (!this.up && this.down)
            return 1
        else
            return 0
    }
    
}
