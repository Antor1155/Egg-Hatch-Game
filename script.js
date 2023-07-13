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
           this.speedX = 0
           this.speedY = 0
           this.speedModifier = 5
           this.dx = 0
           this.dy = 0

           this.image = document.getElementById("bull")
           this.spriteWidth = 255
           this.spriteHeight = 256
           this.height = this.spriteHeight
           this.width = this.spriteWidth
           this.spriteX = this.collisionX - this.width * 0.5
           this.spriteY = this.collisionY - this.height * 0.5
           this.frameX = 0
           this.frameY = 0
        }
        // drawing  a player 
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight,  this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug){

                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.3
                context.fill()
                context.restore()
                context.stroke()
                
                // new line draw 
                context.beginPath()
                context.moveTo(this.collisionX, this.collisionY)
                context.lineTo(this.game.mouse.x, this.game.mouse.y)
                context.stroke()
            }
        }

        update(){
            this.dx = (this.game.mouse.x - this.collisionX)
            this.dy = (this.game.mouse.y - this.collisionY)
            // sprite animation 
            const angle = Math.atan2(this.dy, this.dx)
            if(angle < -2.74 || angle > 2.74) this.frameY = 6
            else if(angle < -1.96) this.frameY = 7
            else if(angle < -1.17) this.frameY = 0
            else if(angle < -0.39) this.frameY = 1
            else if(angle < 0.39) this.frameY = 2
            else if(angle < 1.17) this.frameY = 3
            else if(angle < 1.96) this.frameY = 4
            else if(angle < 2.74) this.frameY = 5
            

            const distance =  Math.hypot(this.dy, this.dx)

            if(distance > this.speedModifier){
                this.speedX = this.dx/distance || 0
                this.speedY = this.dy/distance || 0
            } else {
                this.speedX = 0
                this.speedY = 0
            }
            
            this.collisionX += this.speedX * this.speedModifier
            this.collisionY += this.speedY * this.speedModifier

            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 100

            // horizontal boundaries
            if (this.collisionX < 0 + this.collisionRadius ){
                this.collisionX = this.collisionRadius
            } else if (this.collisionX > this.game.width - this.collisionRadius){
                this.collisionX = this.game.width - this.collisionRadius
            }
            // vertical boundaries 
            if (this.collisionY < this.game.topmargin){
                this.collisionY = this.game.topmargin
            }

            // custom collision funciton to collision and obstacles
            this.game.obstacles.forEach(obstacle =>{
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)

                if(collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x
                    
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y
                }
            })

        }
    }

    class Obstacle {
        constructor(game){
            this.game = game
            this.collisionX = Math.random() * this.game.width
            this.collisionY = Math.random() * this.game.height
            this.collisionRadius = 60

            this.image = document.getElementById("obstacles")
            this.spriteWidth = 250
            this.spriteHeight = 250
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 70
            this.frameX = Math.floor(Math.random() * 4) 
            this.frameY = Math.floor(Math.random() * 3) 
        }

        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
            }
        }
    }

    class Egg{
        constructor(game){
            this.game = game
            this.collisionX = Math.random() * this.game.width
            this.collisionY = Math.random() * this.game.height
            this.collisionRadius = 40

            this.image = document.getElementById("egg")
            this.spriteWidth = 110
            this.spriteHeight = 135
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX = this.collisionX + this.width * 0.5
            this.spriteY = this.collisionY + this.height * 0.5
        }

        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY)

            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
            }
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas
            this.width = this.canvas.width
            this.height = this.canvas.height
            this.topmargin = 240

            this.debug = true
            this.fps = 70
            this.timer = 0
            this.interval = 1000/this.fps

            this.player = new Player(this)
            this.numberOfObstacles = 5
            this.obstacles = []
            this.eggs = []
            this.maxEggs = 5
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
                if(this.mouse.pressed){
                    this.mouse.x = e.offsetX
                    this.mouse.y = e.offsetY
                }
            })

            // debug mode to see collision are for obstacles 
            window.addEventListener("keydown", e =>{
                if (e.key == "d") this.debug = !this.debug
            })
        }
        // render a player 
        render(context, deltaTime){  
            if (this.timer > this.interval){
                context.clearRect(0, 0, this.width, this.height)
                this.obstacles.forEach( obstacle=>obstacle.draw(context) )
                this.player.draw(context)
                this.player.update()

                this.timer = 0
            }
            this.timer += deltaTime 
            
            
        }

        checkCollision(a, b){
            const dx = a.collisionX - b.collisionX
            const dy = a.collisionY - b.collisionY
            const distance = Math.hypot(dy, dx)
            const sumOfRadii = a.collisionRadius + b.collisionRadius

            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        }

        init(){
            let attempts = 0

            while(this.obstacles.length < this.numberOfObstacles && attempts < 500){
                let testObstacle = new Obstacle(this)
                let overlap = false

                this.obstacles.forEach(obstacle =>{
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY; 

                    const distanceBuffer = 150;
                    const distance = Math.hypot(dy, dx)
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer

                    if (distance < sumOfRadii){
                        overlap = true
                    }
                })

                if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY >= this.topmargin + this.player.collisionRadius + testObstacle.collisionRadius){
                    this.obstacles.push(testObstacle)
                }
                attempts++
            }

            // this.obstacles.forEach(obstacle => obstacle.draw())
        }
    }

    const game = new Game(canvas)
    game.init()
    console.log(game)

    // infinite loop of animation function 
    let lastTime = 0
    function animation(timeStamp){
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp

        // ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(ctx, deltaTime)
        
        requestAnimationFrame(animation)
    }

    animation(0)
})