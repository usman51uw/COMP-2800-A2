//Canvas setup
let canvasElement, canvasContext;

window.onload = () => {
    canvasElement = document.getElementById('canvas');
    canvasContext = canvasElement.getContext('2d');
    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);
};