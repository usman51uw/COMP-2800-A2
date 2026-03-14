//Add update function to move objects
function updateGameObjects(){
    //Move all objects based on their type
    gameObjects.forEach(gameObject => {
        if(gameObject.type === 'Enemy'){
            gameObject.y += gameObject.speedY;  //move enemies down
        } else if(gameObject.type === 'Laser'){
            gameObject.y += gameObject.speedY;  //move lasers up
            //Remove laser if off screen top
            if(gameObject.y + gameObject.height < 0){
                gameObject.dead = true;
            }
        }
    });
    
    //Remove dead objects from array
    gameObjects = gameObjects.filter(gameObject => !gameObject.dead);
}

//Add dead flag to GameObject class
class GameObject{
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;      //add dead flag
        this.width = 0;
        this.height = 0;
        this.image = null;
    }

    draw(canvasContext){
        canvasContext.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

//Update game loop to call updateGameObjects
window.onload = async () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');

    heroImage = await loadTexture('images/player.png');
    enemyImage = await loadTexture('images/enemyShip.png');
    laserImage = await loadTexture('images/laserRed.png');
    
    initGame();

    //Game loop
    setInterval(() => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
        
        updateGameObjects();  //Update positions before drawing
        
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
            case ' ': eventEmitter.emit(Messages.KEY_EVENT_SPACE); break;
        }
    });
};