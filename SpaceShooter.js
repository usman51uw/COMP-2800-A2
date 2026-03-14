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
}

//Message constants
const Messages = {
    KEY_EVENT_UP: 'KEY_EVENT_UP',
    KEY_EVENT_DOWN: 'KEY_EVENT_DOWN',
    KEY_EVENT_LEFT: 'KEY_EVENT_LEFT',
    KEY_EVENT_RIGHT: 'KEY_EVENT_RIGHT',
};

//Class setup
class GameObject{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 0;
        this.height = 0;
        this.image = null;
    }

    draw(canvasContext){
        canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

//Player
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
}

class Enemy extends GameObject{
    constructor(x, y){
        super(x, y, 'Enemy');
        this.height = 50;   //height + width come from image size
        this.width = 98;
        this.speedY = 1;
    }
}

//Canvas variables
let canvasElement, canvasContext;

//Character variables
let heroImage, enemyImage, laserImage, lifeImage;
let gameObjects = [];
let hero;
let eventEmitter = new EventEmitter();

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

    for(let x = startX; x<stopX; x+=enemySpacing){
        for(let y = 0; y < 50 * 5; y += 50){
            const enemy = new Enemy(x, y);
            enemy.image = enemyImage;
            gameObjects.push(enemy);
        }
    }
}

function initGame(){
    //Clear any previous state
    gameObjects = [];
    
    //Create initial objects
    createEnemy();
    createHero();

    //Subscribe to movement events
    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y = Math.max(0, hero.y - hero.speed);
    });
    
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y = Math.min(canvasElement.height - hero.height, hero.y + hero.speed);
    });
    
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x = Math.max(0, hero.x - hero.speed);
    });
    
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x = Math.min(canvasElement.width - hero.width, hero.x + hero.speed);
    });
}

window.onload = async () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');

    heroImage = await loadTexture('images/player.png');
    enemyImage = await loadTexture('images/enemyShip.png');
    
    initGame();

    //Game loop
    setInterval(() => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
        gameObjects.forEach(gameObject => gameObject.draw(canvasContext));
    }, 100);

    //Keyboard event listeners
    window.addEventListener('keydown', (event) => {
        //Prevent default scrolling/spacebar page jump
        if([32, 37, 38, 39, 40].includes(event.keyCode)){
            event.preventDefault();
        }

        switch(event.key){
            case 'ArrowUp': eventEmitter.emit(Messages.KEY_EVENT_UP); break;
            case 'ArrowDown': eventEmitter.emit(Messages.KEY_EVENT_DOWN); break;
            case 'ArrowLeft': eventEmitter.emit(Messages.KEY_EVENT_LEFT); break;
            case 'ArrowRight': eventEmitter.emit(Messages.KEY_EVENT_RIGHT); break;
        }
    });
};