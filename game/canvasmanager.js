export class CanvasManager{
    static drawGrid(canvas){
        const cellAmount = 16
        let context = canvas.getContext('2d')
        context.globalAlpha = 0.25
        context.strokeStyle = '#FFFFFF'
        context.lineWidth = 1
        
        let w = canvas.width
        let h = canvas.height
        let wi = w/cellAmount
        let hi = h/cellAmount
        context.beginPath()
        for (let x = 1; x<cellAmount; x++){
            context.moveTo(Math.round(x*wi), 0)
            context.lineTo(Math.round(x*wi), h)
        }
        for (let y = 1; y<cellAmount; y++){
            context.moveTo(0, Math.round(y*hi))
            context.lineTo(w, Math.round(y*hi))
        }
        context.stroke()
        
        context.globalAlpha = 1
    }
}
