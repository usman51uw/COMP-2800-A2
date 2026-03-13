function loadTexture(path){
    return new Promise((resolve) => {
        const image = new Image;
        image.src = path;
        image.onload = () => resolve(image);
    });
}

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
        canvasContext.drawImage(this.image, this.x, this.y, this. width, this. height);
    }
}

//Player
class Hero extends GameObject{
    constructor(x, y){
        super(x, y, 'Hero');
        this.x = x;
        this.y = y;
        this.height= 75;    //height + width come from image size
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

function createHero(){
    hero = new Hero(
        (canvasElement.width / 2) - 45,         //hero's left edge in horizontal center
        canvasElement.height / 4);              //hero is 1/4 height up from bottom
    
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

window.onload = async () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');

    heroImage = await loadTexture('images/player.png');
    enemyImage = await loadTexture('images/enemyShip.png');

    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
};

