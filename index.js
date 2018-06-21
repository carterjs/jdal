//Set up
var canvas = document.getElementById('canvas');
var image = document.createElement('canvas');

var ctx = canvas.getContext('2d');

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
}

//Components
var swing = 0.5; 
var gameOver = false;
var active = false;

var family;
var depth = 3;
function init() {
  family = [];
  for(var i=0;i<depth;i++) {
    family.push([0]);
  }
}
init();

var baseResolution = 1;
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  baseResolution = canvas.width/1000;
}
window.addEventListener('resize', resize);
resize();

var resolution = 1;
var scale = 1;
var targetScale = 1;
var max = 0; 
var maxima = [100];
var minima = [];
var zeros = [];
var pois = [];
var gameOver = false;
var score = -1;
var types = ['max','min','zero','poi']
var target = {
  min: 250,
  max: 300,
  display: {
    min: 1000,
    max: 1000
  },
  type: 'poi',
  completed: false
};
var phrases = ["+C","You try","Keep it real","IMAMI","English was just made up","I don't need a practical application","I am a petty man"];
function updateTarget() {
  target.min = target.max + Math.round(Math.random() * 50);
  target.max = target.min + Math.round(Math.random() * 30 + 20);
  target.completed = false;
  target.type = types[Math.round(Math.random()*3)];
  target.color = "rgb(" + Math.round(30 + Math.random()*100) + "," + Math.round(30 + Math.random()*100) + "," + Math.round(30 + Math.random()*100) + ")";
  score++;
}
updateTarget();
function update(delta) {
  //Update values
  if(family.length > 1) {
    family[0].push(active ? swing : -swing);
    var type = null;
    if(family[0][family[0].length - 1] !== family[0][family[0].length - 2]) {
      //Second derivative hit 0
      pois.push(family[0].length);
      type = "poi";
    }
    for(var i=1;i<family.length;i++) {
      var newVal = family[i][family[i].length - 1] + family[i-1][family[i-1].length - 1];
      if(i === family.length - 1 && (((family[i][family[i].length - 1] < 0) !== (newVal < 0)))) {
        //Base function hit 0
        zeros.push(family[i].length-1);
        type = "zero";
      }
      if(i === family.length - 2 && (((family[i][family[i].length - 1] < 0) !== (newVal < 0)))) {
        //First derivative hit 0
        if(family[0][family[0].length - 1] > 0) {
          minima.push(family[i].length);
          type = "min";
        } else {
          maxima.push(family[i].length);
          type = "max";
        }
      }
      if(!!type && family[0].length > target.min && family[0].length < target.max) {
        if(type == target.type) {
          if(target.completed) {
            gameOver = true;
          } else {
            updateTarget();
          }
        }
      }
      //Check if target has expired
      if(family[0].length > target.max) {
        gameOver = true;
      }
      family[i].push(newVal);
    }
  }
  //Move the displayed target
  target.display.min += (target.min - target.display.min)/10;
  target.display.max += (target.max - target.display.max)/10;
  //Calculate scale
  var last = family[family.length-1]; 
  max = Math.abs(last[last.length - 1]);
  var extrema = maxima.concat(minima);
  for(var i=extrema.length-1;i>0&&i>extrema.length-6;i--) {
    if(Math.abs(last[extrema[i]]) > max) {
      max = Math.abs(last[extrema[i]]);
    }
  }
  targetScale = (canvas.height/3)/max;
  if(targetScale > 10) {
    targetScale = 10;
  }
  //Move toward target scale
  scale += (targetScale - scale)/25;

  //Scale horizontally as well
  resolution = baseResolution * scale;

}
var progress = 0;
function restart(delta) {
  if(active) {
    progress += baseResolution * delta * 10;
  }
  if(progress > canvas.width) {
    score = -1;
    maxima = minima = zeros = pois = [];
    targetScale = 1;
    gameOver = false;
    progress = 0;
    target.display.min = 1000;
    target.display.max = 1000;
    init();
    updateTarget();
  }
}
function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  var barHeight = canvas.height/20;
  //Draw data bars
  ctx.fillStyle = "#ff0";
  ctx.fillRect(0,0,canvas.width,barHeight);
  ctx.fillRect(0,canvas.height-barHeight,canvas.width,barHeight);
  //Move view
  ctx.translate(-family[0].length * resolution + canvas.width/2,canvas.height/2);
  //Draw target area
  ctx.fillStyle = target.color;
  ctx.fillRect(target.display.min*resolution,barHeight-canvas.height/2,(target.display.max-target.display.min)*resolution,canvas.height-2*barHeight);
  //Draw target type
  var center = (target.min+(target.display.max-target.display.min)/2) * resolution;
  ctx.font = Math.round(barHeight*0.8) + "px Impact,sans-serif";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText(target.type,center,0.8*barHeight-canvas.height/2);
  //Draw next score
  ctx.fillText(score+1,center,canvas.height/2-0.2*barHeight);
  //Draw center line
  ctx.beginPath();
  ctx.moveTo(family[0].length * resolution - canvas.width/2,0);
  ctx.lineTo(family[0].length * resolution + canvas.width/2,0);
  ctx.strokeStyle = "#fff"; 
  ctx.stroke();
  for(var i=0;i<family.length;i++) {
    ctx.beginPath();
    for(var j=1;j<family[i].length&&j<canvas.width/2/resolution;j++) {
      ctx.lineTo((family[i].length-j)*resolution,-family[i][family[i].length - j]*scale);
    }
    ctx.strokeStyle = "rgba(255,255,0," + (i+1)/(family.length) + ")";
    ctx.lineWidth = (i+1)/(family.length )*3;
    ctx.stroke();
  }
  ctx.restore();
  if(gameOver) {
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.fillRect(progress,0,canvas.width-progress,canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0,barHeight,progress,canvas.height-2*barHeight);
    ctx.textAlign = "center";
    ctx.font = Math.round(barHeight/2) + "px Impact, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("\"" + phrases[Math.floor(progress/canvas.width*Math.min(phrases.length,score))] + "\"",canvas.width/2,canvas.height/2+barHeight/4);
  }
}
var now = 0;
var then = 0;
var lastUpdate = 0;
var frames = 0;
var fps = 0;
var step = 0;
var targetStep = 1000/60;
function loop() {
  then = now;
  now = Date.now();
  frames++;
  if(now - lastUpdate > 1000) {
    lastUpdate = now;
    fps = frames;
    frames = 0;
  }
  if(!gameOver) {
    update((now - then)/targetStep);
  } else {
    restart((now - then)/targetStep);
  }
  render();
  window.requestAnimationFrame(loop);
};
loop();

//Controls of all kinds
function controlDown() {
  active = true;
}
function controlUp() {
  active = false;
}
window.addEventListener('mousedown', controlDown);
window.addEventListener('mouseup', controlUp);
window.addEventListener('keydown',function(e) {
  if(e.which === 32) {
    controlDown();
  }
});
window.addEventListener('keyup',controlUp  );
window.addEventListener('touchstart',controlDown);
window.addEventListener('touchend',controlUp);
