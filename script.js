window.addEventListener("load", function () {
    const canvas = this.document.getElementById("canvas1")
    const ctx = canvas.getContext("2d")

    canvas.width = 1280
    canvas.height = 720

    const overlay = this.document.getElementById("overlay")
    overlay.width = canvas.width
    // making dynamic height and width 
    function windowResized (){
        const windowHeight = this.window.innerHeight -10
        if (windowHeight < canvas.height){
            const difference = canvas.height - windowHeight
            const newHeight = canvas.height - difference
            
            const newHeightScale = (newHeight / canvas.height).toFixed(2)
            
            canvas.style.transform = `translate(-50%, -50%) scale(${newHeightScale})`
            overlay.style.transform = `translate(-50%, -50%) scale(${newHeightScale})`
            
            console.log("difference:", difference, " newHeight: ", newHeight,  newHeightScale)
        }
    }

    windowResized()
    this.window.addEventListener("resize", windowResized)




    ctx.fillStyle = "white"
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black"

    ctx.font = "40px Bangers"
    ctx.textAlign = "center"

    class Player {
        constructor(game) {
            this.game = game
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 40
            this.speedX = 0
            this.speedY = 0
            this.speedModifier = 7
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

        restart() {
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5
        }
        // drawing  a player 
        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug) {

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

        update() {
            this.dx = (this.game.mouse.x - this.collisionX)
            this.dy = (this.game.mouse.y - this.collisionY)

            // sprite animation 
            const angle = Math.atan2(this.dy, this.dx)
            if (angle < -2.74 || angle > 2.74) this.frameY = 6
            else if (angle < -1.96) this.frameY = 7
            else if (angle < -1.17) this.frameY = 0
            else if (angle < -0.39) this.frameY = 1
            else if (angle < 0.39) this.frameY = 2
            else if (angle < 1.17) this.frameY = 3
            else if (angle < 1.96) this.frameY = 4
            else if (angle < 2.74) this.frameY = 5


            const distance = Math.hypot(this.dy, this.dx)

            if (distance > this.speedModifier) {
                this.speedX = this.dx / distance || 0
                this.speedY = this.dy / distance || 0
            } else {
                this.speedX = 0
                this.speedY = 0
            }

            this.collisionX += this.speedX * this.speedModifier
            this.collisionY += this.speedY * this.speedModifier

            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 100

            // horizontal boundaries
            if (this.collisionX < 0 + this.collisionRadius) {
                this.collisionX = this.collisionRadius
            } else if (this.collisionX > this.game.width - this.collisionRadius) {
                this.collisionX = this.game.width - this.collisionRadius
            }
            // vertical boundaries 
            if (this.collisionY < this.game.topmargin) {
                this.collisionY = this.game.topmargin
            }

            // custom collision funciton to collision and obstacles
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle)

                if (collision) {
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x

                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y
                }
            })

        }
    }

    class Obstacle {
        constructor(game) {
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

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
            }
        }

        update() {

        }
    }

    class Egg {
        constructor(game) {
            this.game = game
            this.collisionRadius = 40
            this.margin = this.collisionRadius * 2
            this.collisionX = this.margin + Math.random() * (this.game.width - this.margin * 2)
            this.collisionY = this.game.topmargin + Math.random() * (this.game.height - this.game.topmargin - this.margin)

            this.image = document.getElementById("egg")
            this.spriteWidth = 110
            this.spriteHeight = 135
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 30

            this.hatchTimer = 0
            this.hatchInterval = 3000
            this.markedForDeletion = false
        }

        draw(context) {
            context.drawImage(this.image, this.spriteX, this.spriteY)

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
                // draw timer over eggs 
                const displayTimer = (this.hatchTimer / 1000).toFixed()
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5)
            }
        }

        update(deltaTime) {
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 30

            // collision detection here 
            let collisionObjects = [this.game.player, ...this.game.obstacles, ...this.game.enemies]
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if (collision) {
                    const unit_x = dx / distance
                    const unit_y = dy / distance

                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y

                }
            })

            // hatching 
            if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topmargin) {
                this.markedForDeletion = true
                this.game.removeGameObjects()

                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY))
            }
            else {
                this.hatchTimer += deltaTime
            }

        }
    }

    class Larva {
        constructor(game, x, y) {
            this.game = game
            this.collisionX = x
            this.collisionY = y
            this.collisionRadius = 30
            this.image = document.getElementById("larva")

            this.spriteWidth = 150
            this.spriteHeight = 150
            this.width = this.spriteWidth
            this.height = this.spriteWidth
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 30

            this.speedY = 1 + Math.random()

            this.frameX = 0
            this.frameY = Math.floor(Math.random() * 2)
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
            }
        }

        update() {
            this.collisionY -= this.speedY
            this.spriteX = this.collisionX - this.width * 0.5
            this.spriteY = this.collisionY - this.height * 0.5 - 30

            if (this.collisionY < this.game.topmargin) {
                this.markedForDeletion = true
                this.game.removeGameObjects()
                // logic to not add score and egges when game over 
                if (!this.game.gameOver) this.game.score++


                // creating particles when larva hides in bushes
                for (let i = 0; i < 3; i++) {
                    this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, "yellow"))
                }
            }

            // collision detection here 
            let collisionObjects = [this.game.player, ...this.game.obstacles]
            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if (collision) {
                    const unit_x = dx / distance
                    const unit_y = dy / distance

                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y

                }
            })

            // collision with enemies 
            this.game.enemies.forEach(enemy => {
                if (this.game.checkCollision(this, enemy)[0]) {
                    this.markedForDeletion = true
                    this.game.removeGameObjects()
                    if (!this.game.gameOver) this.game.lostHatchlings++

                    // creating sparks when larva eaten by enemies
                    for (let i = 0; i < 5; i++) {
                        this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, "blue"))
                    }
                }
            })
        }
    }

    class Enemy {
        constructor(game) {
            this.game = game
            this.collisionRadius = 40
            this.speedX = Math.random() * 3 + 0.5

            this.image = document.getElementById("toads")
            this.spriteWidth = 140
            this.spriteHeight = 260
            this.width = this.spriteWidth
            this.height = this.spriteHeight
            this.spriteX
            this.spriteY

            this.frameX = 0
            this.frameY = Math.floor(Math.random() * 4) * this.spriteHeight

            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5
            this.collisionY = this.game.topmargin + Math.random() * (this.game.height - this.game.topmargin)
        }

        draw(context) {
            context.drawImage(this.image, this.frameX, this.frameY, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height)

            if (this.game.debug) {
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2)
                context.save() // anything between save and restore will not affect other sector to cavnas drow, like, fill will be affected but stroke will not 
                context.globalAlpha = 0.8
                context.fill()
                context.restore()
                context.stroke()
            }
        }

        update() {
            this.spriteX = this.collisionX - this.width * 0.5 + 10
            this.spriteY = this.collisionY - this.height * 0.5 - 50

            this.collisionX -= this.speedX

            // when passes left side of screen , regenerate from right side of the screen 
            if (this.spriteX + this.width < 0 && !this.game.gameOver) {
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5

                this.collisionY = this.game.topmargin + Math.random() * (this.game.height - this.game.topmargin)

                this.frameY = Math.floor(Math.random() * 4) * this.spriteHeight
            }

            // collision detection 
            let collisionObjects = [this.game.player, ...this.game.obstacles]

            collisionObjects.forEach(object => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object)
                if (collision) {
                    const unit_x = dx / distance
                    const unit_y = dy / distance

                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y
                }
            })
        }

    }

    class Particle {
        constructor(game, x, y, color) {
            this.game = game
            this.collisionX = x
            this.collisionY = y
            this.color = color
            this.radius = Math.floor(Math.random() * 10 + 5)
            this.speedX = Math.random() * 6 - 3
            this.speedY = Math.random() * 2 + 0.5
            this.angle = 0
            this.va = Math.random() * 0.1 + 0.01
            this.markedForDeletion = false
        }

        draw(context) {
            context.save()
            context.fillStyle = this.color
            context.beginPath()
            context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2)
            context.fill()
            context.stroke()
            context.restore()
        }
    }

    class Firefly extends Particle {
        update() {
            this.angle += this.va
            this.collisionX += Math.cos(this.angle) * this.speedX
            this.collisionY -= this.speedY
            if (this.collisionY < 0 - this.radius) {
                this.markedForDeletion = true
                this.game.removeGameObjects()
            }
        }
    }

    class Spark extends Particle {
        update() {
            this.angle += this.va * 0.5
            this.collisionX -= Math.cos(this.angle) * this.speedX
            this.collisionY -= Math.sin(this.angle) * this.speedY

            if (this.radius > 0.1) {
                this.radius -= 0.05
            } else {
                this.markedForDeletion = true
                this.game.removeGameObjects()
            }
        }
    }

    class Game {
        constructor(canvas) {
            this.canvas = canvas
            this.width = this.canvas.width
            this.height = this.canvas.height
            this.topmargin = 240

            this.debug = false
            this.fps = 70
            this.timer = 0
            this.interval = 1000 / this.fps

            this.gameOver = false

            this.player = new Player(this)
            this.numberOfObstacles = 5
            this.obstacles = []

            this.eggTimer = 0
            this.eggInterval = 500
            this.eggs = []
            this.maxEggs = 5

            this.hatchlings = []

            this.maxEnemy = 5
            this.enemies = []

            this.gameObjects = []

            this.score = 0
            this.lostHatchlings = 0

            this.particles = []

            this.winningScore = 1
            this.loosingScore = 5

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
                if (this.mouse.pressed) {
                    this.mouse.x = e.offsetX
                    this.mouse.y = e.offsetY
                }
            })

            // debug mode to see collision are for obstacles 
            window.addEventListener("keydown", e => {
                if (e.key == "d") this.debug = !this.debug
                else if (e.key == "r") {
                    this.restart()
                }
            })
        }
        // render 
        render(context, deltaTime) {
            // the main render fucntion to render according to fps 
            if (this.timer > this.interval) {
                context.clearRect(0, 0, this.width, this.height)
                this.gameObjects = [this.player, ...this.obstacles, ...this.eggs, ...this.enemies, ...this.hatchlings, ...this.particles]

                // sort array by vertical position as drawn first go back
                this.gameObjects.sort((a, b) => a.collisionY - b.collisionY)
                this.gameObjects.forEach(object => {
                    object.draw(context)
                    object.update(deltaTime)
                })
                this.timer = 0

                // draw status text 
                context.save()
                context.textAlign = "left"
                context.fillText(`Score : ${this.score}`, 25, 50)
                if (this.debug) {
                    context.fillText(`Lost Larva : ${this.lostHatchlings}`, 25, 100)
                }
                context.restore()

                // winning and loosing message 
                if (this.score >= this.winningScore) {
                    this.gameOver = true
                    context.save()
                    context.fillStyle = "rgba(0, 0, 0, 0.5)"
                    context.fillRect(0, 0, this.width, this.height)

                    context.fillStyle = "white"
                    context.textAlign = "center"
                    context.shadowOffsetX = 4
                    context.shadowOffsetY = 5
                    context.shadowColor = "yellow"

                    let message1
                    let message2
                    if (this.lostHatchlings <= this.loosingScore) {
                        message1 = "BullsEye !!!"
                        message2 = "You bullied the bullies !"
                    } else {
                        message1 = "Bullocks !"
                        message2 = "You lost " + this.lostHatchlings + " Hachlinks"
                    }

                    context.font = "130px Bangers"
                    context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20)
                    context.restore()
                    context.save()
                    context.font = "40px Bangers"
                    context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30)
                    context.fillText("Final Score : " + this.score + ". Press 'R' to restart !", this.width * 0.5, this.height * 0.5 + 80)

                    context.restore()
                }
            }
            this.timer += deltaTime

            // add eggs periodically 
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
                this.addEgg()
                this.eggTimer = 0
            } else {
                this.eggTimer += deltaTime
            }


        }

        checkCollision(a, b) {
            const dx = a.collisionX - b.collisionX
            const dy = a.collisionY - b.collisionY
            const distance = Math.hypot(dy, dx)
            const sumOfRadii = a.collisionRadius + b.collisionRadius

            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy]
        }

        addEgg() {
            this.eggs.push(new Egg(this))
        }

        addEnemy() {
            this.enemies.push(new Enemy(this))
        }

        removeGameObjects() {
            this.eggs = this.eggs.filter(object => !object.markedForDeletion)
            this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion)
            this.particles = this.particles.filter(object => !object.markedForDeletion)

        }

        restart() {
            this.player.restart()
            this.obstacles = []
            this.eggs = []
            this.enemies = []
            this.hatchlings = []
            this.particles = []
            this.init()
            this.gameOver = false
            this.score = 0
            this.lostHatchlings = 0
            this.mouse = {
                x: this.width * 0.5,
                y: this.width * 0.5,
                pressed: false
            }
        }

        init() {
            for (let i = 0; i < this.maxEnemy; i++) {
                this.addEnemy()
            }

            let attempts = 0

            while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {
                let testObstacle = new Obstacle(this)
                let overlap = false

                this.obstacles.forEach(obstacle => {
                    const dx = testObstacle.collisionX - obstacle.collisionX;
                    const dy = testObstacle.collisionY - obstacle.collisionY;

                    const distanceBuffer = 150;
                    const distance = Math.hypot(dy, dx)
                    const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer

                    if (distance < sumOfRadii) {
                        overlap = true
                    }
                })

                if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width && testObstacle.collisionY >= this.topmargin + this.player.collisionRadius + testObstacle.collisionRadius) {
                    this.obstacles.push(testObstacle)
                }
                attempts++
            }
        }
    }

    const game = new Game(canvas)
    game.init()

    // infinite loop of animation function 
    let lastTime = 0
    function animation(timeStamp) {
        const deltaTime = timeStamp - lastTime
        lastTime = timeStamp

        // ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.render(ctx, deltaTime)

        requestAnimationFrame(animation)
    }

    animation(0)
})