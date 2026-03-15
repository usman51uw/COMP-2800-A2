//Load life image in window.onload (add this line)
lifeImage = await loadTexture('images/life.png');

//Add UI drawing functions
function drawPoints(){
    canvasContext.font = '30px Arial';
    canvasContext.fillStyle = 'red';
    canvasContext.textAlign = 'left';
    canvasContext.fillText(`Points: ${hero.points}`, 10, canvasElement.height - 20);
}

function drawLife(){
    const startPos = canvasElement.width - 180;
    for(let i = 0; i < hero.life; i++){
        canvasContext.drawImage(
            lifeImage,
            startPos + 45 * (i + 1),
            canvasElement.height - 37,
            35, 27  //life.png dimensions
        );
    }
}

//Add increment/decrement methods to Hero
class Hero extends GameObject{
    constructor(x, y){
        super(x, y, 'Hero');
        this.x = x;
        this.y = y;
        this.height = 75;    //height + width come from image size
        this.width = 99;
        this.life = 3;
        this.speed = 8;
        this.points = 0;
    }

    fire(){
        gameObjects.push(new Laser(this.x + 45, this.y - 10));  //center laser on hero
    }

    decrementLife(){
        this.life--;
        if(this.life === 0) this.dead = true;
    }

    incrementPoints(){
        this.points += 100;
    }
}

//Add collision handlers in initGame
function initGame(){
    //Clear any previous state
    gameObjects = [];
    
    //Create initial objects
    createEnemy();
    createHero();

    //Subscribe to movement events (using camelCase)
    eventEmitter.on(Messages.keyEventUp, () => {
        hero.y = Math.max(0, hero.y - hero.speed);
    });
    
    eventEmitter.on(Messages.keyEventDown, () => {
        hero.y = Math.min(canvasElement.height - hero.height, hero.y + hero.speed);
    });
    
    eventEmitter.on(Messages.keyEventLeft, () => {
        hero.x = Math.max(0, hero.x - hero.speed);
    });
    
    eventEmitter.on(Messages.keyEventRight, () => {
        hero.x = Math.min(canvasElement.width - hero.width, hero.x + hero.speed);
    });

    //Add space key handler (using camelCase)
    eventEmitter.on(Messages.keyEventSpace, () => {
        hero.fire();
    });

    //Handle laser-enemy collision (using camelCase)
    eventEmitter.on(Messages.collisionEnemyLaser, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();
    });

    //Handle enemy-hero collision (using camelCase)
    eventEmitter.on(Messages.collisionEnemyHero, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();
    });
}

//Update game loop to draw UI
//Replace the existing setInterval with this:
setInterval(() => {
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
    
    updateGameObjects();
    
    drawPoints();    //draw score
    drawLife();      //draw life icons
    
    gameObjects.forEach(gameObject => gameObject.draw(canvasContext));
}, 100);