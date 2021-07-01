export class AntiXSS{
    static to_safe(string){
        let safe = string
        safe = safe.replace(/</g, '&lt;')
        safe = safe.replace(/>/g, '&gt;')
        return safe
    }
}