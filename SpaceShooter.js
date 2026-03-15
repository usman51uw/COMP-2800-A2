function loadTexture(path){
    return new Promise((resolve) => {
        const image = new Image();
        image.src = path;
        image.onload = () => resolve(image);
    });
}

//Event system for communication
class EventEmitter {
    constructor(){
        this.listeners = {};
    }

    on(message, listener){
        if(!this.listeners[message]){
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null){
        if(this.listeners[message]){
            this.listeners[message].forEach(listener => listener(message, payload));
        }
    }

    clear(){
        this.listeners = {};
    }
}

//Message constants (camelCase)
const Messages = {
    //Keyboard events
    keyEventUp: 'keyEventUp',
    keyEventDown: 'keyEventDown',
    keyEventLeft: 'keyEventLeft',
    keyEventRight: 'keyEventRight',
    keyEventSpace: 'keyEventSpace',
    keyEventEnter: 'keyEventEnter',
    
    //Collision events
    collisionEnemyLaser: 'collisionEnemyLaser',
    collisionEnemyHero: 'collisionEnemyHero',
    
    //Game end events
    gameEndWin: 'gameEndWin',
    gameEndLoss: 'gameEndLoss'
};

//Class setup
class GameObject{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;      //object marked for removal
        this.width = 0;
        this.height = 0;
        this.image = null;
    }

    draw(canvasContext){
        canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    getRectangle(){
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }
}

//Laser class
class Laser extends GameObject{
    constructor(x, y){
        super(x, y, 'Laser');
        this.width = 9;         //from laser image size
        this.height = 33;
        this.speedY = -8;       //negative = moving up
    }
}

//Player class with cooldown
class Hero extends GameObject{
    constructor(x, y){
        super(x, y, 'Hero');
        this.x = x;
        this.y = y;
        this.height = 75;    //height + width come from image size
        this.width = 99;
        this.life = 3;
        this.speed = 6;       //movement speed per frame
        this.points = 0;
        this.cooldown = 0;      //frames until next shot
    }

    fire(){
        if(this.canFire()){
            const laser = new Laser(this.x + 45, this.y - 10);  //center laser on hero (99/2 ≈ 45)
            laser.image = laserImage;
            gameObjects.push(laser);
            this.cooldown = 4;  //4 frame cooldown (prevents spamming)
        }
    }

    canFire(){
        return this.cooldown === 0;
    }

    decrementLife(){
        this.life--;
        if(this.life === 0) this.dead = true;
    }

    incrementPoints(){
        this.points += 100;
    }
}

//Enemy class
class Enemy extends GameObject{
    constructor(x, y){
        super(x, y, 'Enemy');
        this.height = 50;   //height + width come from image size
        this.width = 98;
        this.speedY = 0.5;    //pixels per frame moving down (slower)
    }
}

//Collision detection function
function intersectRect(rectangle1, rectangle2){
    //returns true if rectangles overlap, false if they are separated
    return !(
        rectangle2.left > rectangle1.right ||
        rectangle2.right < rectangle1.left ||
        rectangle2.top > rectangle1.bottom ||
        rectangle2.bottom < rectangle1.top
    );
}

//Canvas variables
let canvasElement, canvasContext;

//Character variables
let heroImage, enemyImage, laserImage, lifeImage;
let gameObjects = [];       //array holding all active game objects
let hero;
let eventEmitter = new EventEmitter();
let gameLoopId;             //stores interval ID so we can clear it later

function createHero(){
    hero = new Hero(
        (canvasElement.width / 2) - 45,         //hero's left edge in horizontal center
        canvasElement.height - canvasElement.height / 4);              //hero is 1/4 height up from bottom
    
    hero.image = heroImage;
    gameObjects.push(hero);     //Add hero to gameObjects array
}

function createEnemy(){
    const enemyTotal = 5;
    const enemySpacing = 98;    //enemy width (each)
    const formationWidth = enemyTotal * enemySpacing;
    const startX = (canvasElement.width - formationWidth) / 2;  //where left edge starts
    const stopX = startX + formationWidth;  //where right edge ends

    //nested loops create 5x5 grid
    for(let x = startX; x < stopX; x += enemySpacing){
        for(let y = 0; y < 50 * 5; y += 50){
            const enemy = new Enemy(x, y);
            enemy.image = enemyImage;
            gameObjects.push(enemy);
        }
    }
}

//UI drawing functions
function drawPoints(){
    canvasContext.font = '30px Arial';
    canvasContext.fillStyle = 'red';
    canvasContext.textAlign = 'left';
    canvasContext.fillText(`Points: ${hero.points}`, 10, canvasElement.height - 20);
}

function drawLife(){
    const startPos = canvasElement.width - 180;  //starting position for life icons
    for(let i = 0; i < hero.life; i++){
        canvasContext.drawImage(
            lifeImage,
            startPos + 45 * (i + 1),    //spread icons horizontally
            canvasElement.height - 37,
            35, 27  //life.png dimensions
        );
    }
}

function displayMessage(message, color = 'red'){
    canvasContext.font = '30px Arial';
    canvasContext.fillStyle = color;
    canvasContext.textAlign = 'center';
    canvasContext.fillText(message, canvasElement.width / 2, canvasElement.height / 2);
}

//Update function to move objects and check collisions
function updateGameObjects(){
    //Move objects
    gameObjects.forEach(gameObject => {
        if(gameObject.type === 'Enemy'){
            gameObject.y += gameObject.speedY;  //move enemies down
            //Check if enemy reaches bottom -> game loss
            if(gameObject.y + gameObject.height >= canvasElement.height){
                eventEmitter.emit(Messages.gameEndLoss);
            }
        } else if(gameObject.type === 'Laser'){
            gameObject.y += gameObject.speedY;  //move lasers up
            //Remove laser if off screen top
            if(gameObject.y + gameObject.height < 0){
                gameObject.dead = true;
            }
        }
    });

    //Check laser vs enemy collisions
    const lasers = gameObjects.filter(gameObject => gameObject.type === 'Laser' && !gameObject.dead);
    const enemies = gameObjects.filter(gameObject => gameObject.type === 'Enemy' && !gameObject.dead);

    lasers.forEach(laser => {
        enemies.forEach(enemy => {
            if(intersectRect(laser.getRectangle(), enemy.getRectangle())){
                eventEmitter.emit(Messages.collisionEnemyLaser, { first: laser, second: enemy });
            }
        });
    });

    //Check enemy vs hero collisions
    enemies.forEach(enemy => {
        if(!enemy.dead && hero && !hero.dead){
            if(intersectRect(enemy.getRectangle(), hero.getRectangle())){
                eventEmitter.emit(Messages.collisionEnemyHero, { enemy });
            }
        }
    });
    
    //Remove dead objects from array
    gameObjects = gameObjects.filter(gameObject => !gameObject.dead);
}

//End game function
function endGame(win){
    clearInterval(gameLoopId);  //stop game loop
    setTimeout(() => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
        if(win){
            displayMessage('Victory! Press [Enter] to restart', 'green');
        } else {
            displayMessage('Game Over! Press [Enter] to restart');
        }
    }, 200);  //short delay to ensure final frame renders
}

//Reset game function
function resetGame(){
    if(gameLoopId){
        clearInterval(gameLoopId);          //stop current game
        eventEmitter.clear();                //remove all event listeners
        
        //Re-initialize the game completely
        gameObjects = [];                    //clear all objects
        createEnemy();                       //create fresh enemies
        createHero();                        //create fresh hero
        
        //Re-attach all event listeners (they were cleared)
        initEventListeners();
        
        //start new game loop
        gameLoopId = setInterval(() => {
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.fillStyle = 'black';
            canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
            
            if(hero.cooldown > 0) hero.cooldown--;  //decrement cooldown each frame
            
            updateGameObjects();
            drawPoints();
            drawLife();
            
            gameObjects.forEach(gameObject => gameObject.draw(canvasContext));
        }, 33);  //33ms = ~30fps for smoother motion
    }
}

//Separate function to set up event listeners
function initEventListeners(){
    //Subscribe to movement events
    eventEmitter.on(Messages.keyEventUp, () => {
        hero.y = Math.max(0, hero.y - hero.speed);  //prevent going above screen
    });
    
    eventEmitter.on(Messages.keyEventDown, () => {
        hero.y = Math.min(canvasElement.height - hero.height, hero.y + hero.speed);  //prevent going below screen
    });
    
    eventEmitter.on(Messages.keyEventLeft, () => {
        hero.x = Math.max(0, hero.x - hero.speed);  //prevent going left off screen
    });
    
    eventEmitter.on(Messages.keyEventRight, () => {
        hero.x = Math.min(canvasElement.width - hero.width, hero.x + hero.speed);  //prevent going right off screen
    });

    //Space key handler
    eventEmitter.on(Messages.keyEventSpace, () => {
        hero.fire();
    });

    //Enter key handler for restart
    eventEmitter.on(Messages.keyEventEnter, () => {
        resetGame();
    });

    //Handle laser-enemy collision
    eventEmitter.on(Messages.collisionEnemyLaser, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();

        //Check win condition - all enemies dead
        if(gameObjects.filter(gameObject => gameObject.type === 'Enemy' && !gameObject.dead).length === 0){
            eventEmitter.emit(Messages.gameEndWin);
        }
    });

    //Handle enemy-hero collision
    eventEmitter.on(Messages.collisionEnemyHero, (_, { enemy }) => {
        enemy.dead = true;
        hero.decrementLife();

        if(hero.dead){
            eventEmitter.emit(Messages.gameEndLoss);
        } else {
            //After losing a life, check if all enemies are dead
            if(gameObjects.filter(gameObject => gameObject.type === 'Enemy' && !gameObject.dead).length === 0){
                eventEmitter.emit(Messages.gameEndWin);
            }
        }
    });

    //Game end handlers
    eventEmitter.on(Messages.gameEndWin, () => {
        endGame(true);
    });

    eventEmitter.on(Messages.gameEndLoss, () => {
        endGame(false);
    });
}

function initGame(){
    //Clear any previous state
    gameObjects = [];
    
    //Create initial objects
    createEnemy();
    createHero();

    //Set up all event listeners
    initEventListeners();
}

window.onload = async () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');

    //load all game images
    heroImage = await loadTexture('images/player.png');
    enemyImage = await loadTexture('images/enemyShip.png');
    laserImage = await loadTexture('images/laserRed.png');
    lifeImage = await loadTexture('images/life.png');
    
    initGame();

    //Start game loop (runs every 33ms = ~30fps for smoother motion)
    gameLoopId = setInterval(() => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        if(hero.cooldown > 0) hero.cooldown--;  //decrement cooldown each frame
        
        updateGameObjects();
        drawPoints();
        drawLife();
        
        gameObjects.forEach(gameObject => gameObject.draw(canvasContext));
    }, 33);  //33ms = ~30fps

    //Keyboard event listeners
    window.addEventListener('keydown', (event) => {
        //Prevent default scrolling/spacebar page jump
        if([32, 37, 38, 39, 40].includes(event.keyCode)){
            event.preventDefault();
        }

        switch(event.key){
            case 'ArrowUp': eventEmitter.emit(Messages.keyEventUp); break;
            case 'ArrowDown': eventEmitter.emit(Messages.keyEventDown); break;
            case 'ArrowLeft': eventEmitter.emit(Messages.keyEventLeft); break;
            case 'ArrowRight': eventEmitter.emit(Messages.keyEventRight); break;
            case ' ': eventEmitter.emit(Messages.keyEventSpace); break;
            case 'Enter': eventEmitter.emit(Messages.keyEventEnter); break;
        }
    });
};