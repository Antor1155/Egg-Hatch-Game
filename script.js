window.addEventListener("load", function(){
    const canvas =this.document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")
    
    canvas.width = 1280
    canvas.height = 720
    
    ctx.fillStyle = "white"
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white"

    this.document.getElementById("overlay").width = canvas.width

    class Player {
        constructor(game){
           this.game = game
           this.collisionX = this.game.width * 0.5;
           this.collisionY = this.game.height * 0.5;
           this.collisionRadius = 30
        }
        // drawing  a player 
        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
            context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
            context.globalAlpha = 0.3
            context.fill()
            context.restore()
            context.stroke()
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas
            this.width = this.canvas.width
            this.height = this.canvas.height
            this.player = new Player(this)
            this.mouse = {
                x: this.width * 0.5,
                y: this.width * 0.5,
                pressed: false
            }

            // any normal code here 
            canvas.addEventListener("mousedown", e => {
                this.mouse.x = e.offsetX
                this.mouse.y = e.offsetY
                this.mouse.pressed = true

            })

            canvas.addEventListener("mouseup", e => {
                this.mouse.x = e.offsetX
                this.mouse.y = e.offsetY
                this.mouse.pressed = false
            })

            canvas.addEventListener("mousemove", e => {
                this.mouse.x = e.offsetX
                this.mouse.y = e.offsetY
            })
        }
        // render a player 
        render(context){
            this.player.draw(context)
            
        }
    }

    const game = new Game(canvas)
    game.render(ctx)
    console.log(game)
})