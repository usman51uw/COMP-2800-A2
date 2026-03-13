function loadTexture(path){
    return new Promise((resolve) => {
        const image = new Image;
        image.src = path;
        image.onload = () => resolve(image);
    });
}

//Canvas setup
let canvasElement, canvasContext;

window.onload = () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
};

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
