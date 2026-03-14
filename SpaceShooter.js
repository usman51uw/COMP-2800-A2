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

let eventEmitter = new EventEmitter();

//Update Hero class - already has speed property

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

//Update window.onload
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