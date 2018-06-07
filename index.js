//Set up
var canvas = document.getElementById('canvas');
var image = document.createElement('canvas');

var ctx = canvas.getContext('2d');

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
}

//Components
var x = 0;
var swing = 0.2;
var acceleration = 0;
var velocity = 0;
var position = 0;
var gameOver = false;
var total = 0;

//Layers
var accelerationLayer = document.createElement('canvas');
var actx = accelerationLayer.getContext('2d');
var velocityLayer = document.createElement('canvas');
var vctx = velocityLayer.getContext('2d');
var positionLayer = document.createElement('canvas');
var pctx = positionLayer.getContext('2d');

function resize() {
  canvas.width = accelerationLayer.width = velocityLayer.width = positionLayer.width = window.innerWidth;
  canvas.height = accelerationLayer.height = velocityLayer.height = positionLayer.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function update() {
  if(acceleration !== 0) {
    x += canvas.width / 1000;
    velocity += acceleration;
    position += velocity;
    total += position * position;
  }
  if (x > canvas.width) {
    gameOver = true;
  }
}

function render() {
  // ctx.fillStyle = "rgba(" + (getDistance(x, position, x, 0) / canvas.height / 2) * 255 + ",0,0)";
  // ctx.fillRect(x - 1, canvas.height / 2 - position / 10 - 1, 3, 3);
  // ctx.fillStyle = "rgba(0,0,0,0.5)";
  // ctx.fillRect(x, canvas.height / 2 - velocity, 1, 1);
  // ctx.fillRect(x, canvas.height / 2 - acceleration * canvas.height / 4, 1, 1);
  // ctx.fillStyle = "rgba(0,255,0," + Math.round((x % 15) / 15) + ")";
  // ctx.fillRect(x - 1, canvas.height / 2 - 1, 3, 3);
  //Draw acceleration
  actx.clearRect(0,0,canvas.width,canvas.height);
  actx.beginPath();
  actx.moveTo(x,canvas.height / 2 - acceleration * 40 - 1);
  actx.lineTo(x,canvas.height / 2 - acceleration * 40 + 1);
  actx.strokeStyle = "#444";
  actx.stroke();
  ctx.drawImage(accelerationLayer,0,0);
  //Draw velocity
  vctx.clearRect(0,0,canvas.width,canvas.height);
  vctx.beginPath();
  vctx.moveTo(x,canvas.height / 2 - velocity * 10 - 2);
  vctx.lineTo(x,canvas.height / 2 - velocity * 10 + 2);
  vctx.strokeStyle = "#888";
  vctx.stroke();
  ctx.drawImage(velocityLayer,0,0);
  //Draw position
  pctx.clearRect(0,0,canvas.width,canvas.height);
  pctx.beginPath();
  pctx.moveTo(x,canvas.height / 2 - position - 5);
  pctx.lineTo(x,canvas.height / 2 - position + 5);
  var rightness = 1 - Math.abs(position/(canvas.height/2));
  pctx.strokeStyle = "rgba(255," + rightness * 255 + "," + rightness * 255 + ")";
  pctx.stroke();
  ctx.drawImage(positionLayer,0,0);
  ctx.beginPath();
  ctx.moveTo(x-canvas.height/1000,canvas.height/2);
  ctx.lineTo(x,canvas.height/2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#0f0";
  ctx.stroke();
}
var progress = 0;
var go = false;

function delay() {
  console.log(total / (Math.pow(1000, 2)));
  if (go) {
    ctx.fillStyle = "rgba(0,255,0,0.25)";
    ctx.fillRect(progress, 0, canvas.width / 100, canvas.height);
    progress += canvas.width / 100;
  }
  if (progress > canvas.width) {
    x = 0;
    position = 0;
    velocity = 0;
    acceleration = -swing;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOver = false;
    progress = 0;
    go = false;
  }
}

function loop() {
  if (!gameOver) {
    update();
    render();
  } else {
    delay();
  }
  window.requestAnimationFrame(loop);
};
loop();
function pointerDown() {
  if (gameOver) {
    go = true;
  } else {
    acceleration = swing;
  }
}
function pointerUp() {
  if (gameOver) {
    go = false;
  } else {
    acceleration = -swing;
  }
}
window.addEventListener('mousedown', pointerDown);
window.addEventListener('mouseup', pointerUp);
window.addEventListener('keydown',function(e) {
  if(e.which === 32) {
    pointerDown();
  }
});
window.addEventListener('keyup',function(e) {
  if(e.which === 32) {
    pointerUp();
  }
});
window.addEventListener('touchstart',pointerDown);
window.addEventListener('touchend',pointerUp);