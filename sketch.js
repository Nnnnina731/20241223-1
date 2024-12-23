// 第一個角色的精靈圖
let sprite1Idle, sprite1Walk, sprite1Jump;
// 第二個角色的精靈圖
let sprite2Idle, sprite2Walk, sprite2Jump;

let animations = {
  player1: [],
  player2: []
};
let currentAnimation = {
  player1: 0,
  player2: 0
};
let frameIndex = {
  player1: 0,
  player2: 0
};
let backgroundImg;
// 定義每個動作的參數
const animationData = {
  player1: [
    { 
      name: '站立',
      frames: 4,
      width: 79,
      height: 121,
      scale: 2
    },
    { 
      name: '走路',
      frames: 6,
      width: 96,
      height: 99,
      scale: 2
    },
    { 
      name: '跳躍',
      frames: 6,
      width: 100,
      height: 96,
      scale: 2
    }
  ],
  player2: [
    { 
      name: '站立',
      frames: 6,
      width: 77,
      height: 117,
      scale: 2
    },
    { 
      name: '走路',
      frames: 6,
      width: 100,
      height: 96,
      scale: 2
    },
    { 
      name: '跳躍',
      frames: 4,
      width: 61,
      height: 115,
      scale: 2
    }
  ]
};
let health = {
  player1: 100,
  player2: 100
};

let bullets = {
  player1: [],
  player2: []
};
function preload() {
  // 載入背景圖片
  backgroundImg = loadImage('assets/b.png');
  
  // 原有的精靈圖載入
  sprite1Idle = loadImage('assets/player1_all.png');
  sprite1Walk = loadImage('assets/player1_all1.png');
  sprite1Jump = loadImage('assets/player1_all2.png');
  
  sprite2Idle = loadImage('assets/player2_all.png');
  sprite2Walk = loadImage('assets/player2_all1.png');
  sprite2Jump = loadImage('assets/player2_all2.png');
  bombImg = loadImage('assets/bu.png');  // 請確保有這個圖片
  explosionImg = loadImage('assets/bu.png')
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12);
  imageMode(CENTER);

  // 設置第一個角色的動畫
  animations.player1 = setupPlayerAnimations(
    [sprite1Idle, sprite1Walk, sprite1Jump],
    animationData.player1
  );

  // 設置第二個角色的動畫
  animations.player2 = setupPlayerAnimations(
    [sprite2Idle, sprite2Walk, sprite2Jump],
    animationData.player2
  );
  
}
// 添加炸彈類別
class Bullet {
  constructor(x, y, player) {
    this.x = x;
    this.y = y;
    this.player = player;
    this.speed = 15;  // 發射物速度
    this.size = 30;   // 發射物大小
    this.damage = 10; // 傷害值
    this.active = true;
  }

  update() {
    // 根據玩家方向移動
    if (this.player === 'player1') {
      this.x += this.speed;
    } else {
      this.x -= this.speed;
    }

    // 檢查碰撞
    this.checkCollision();

    // 如果超出畫面則移除
    return (this.x < 0 || this.x > width || !this.active);
  }

  draw() {
    if (this.active) {
      image(bombImg, this.x, this.y, this.size, this.size);
    }
  }

  checkCollision() {
    if (!this.active) return;

    // 獲取目標玩家位置
    let targetX = (this.player === 'player1') ? 2 * width/3 : width/3;
    let targetY = height/2;
    let hitboxSize = 50; // 碰撞箱大小

    // 簡單的矩形碰撞檢測
    if (Math.abs(this.x - targetX) < hitboxSize && 
        Math.abs(this.y - targetY) < hitboxSize) {
      // 造成傷害
      if (this.player === 'player1') {
        health.player2 = Math.max(0, health.player2 - this.damage);
      } else {
        health.player1 = Math.max(0, health.player1 - this.damage);
      }
      this.active = false; // 發射物消失
    }
  }
}
function drawHealthBars() {
  // 玩家1生命值
  fill(0);
  textAlign(LEFT);
  text(`P1: ${health.player1}%`, 20, 30);
  noFill();
  stroke(0);
  rect(20, 40, 200, 20);
  fill(255, 0, 0);
  rect(20, 40, health.player1 * 2, 20);

  // 玩家2生命值
  fill(0);
  textAlign(RIGHT);
  text(`P2: ${health.player2}%`, width - 20, 30);
  noFill();
  stroke(0);
  rect(width - 220, 40, 200, 20);
  fill(0, 0, 255);
  rect(width - 220, 40, health.player2 * 2, 20);
}

function setupPlayerAnimations(sprites, data) {
  let playerAnimations = [];
  for(let i = 0; i < 3; i++) {
    playerAnimations[i] = [];
    for(let j = 0; j < data[i].frames; j++) {
      playerAnimations[i][j] = sprites[i].get(
        j * data[i].width,
        0,
        data[i].width,
        data[i].height
      );
    }
  }
  return playerAnimations;
}

function draw() {
  push();
  imageMode(CORNER);
  image(backgroundImg, 0, 0, width, height);
  pop();
  
  displayControls();
  drawGround();
  drawHealthBars(); // 添加生命值顯示
  
  // 更新和繪製發射物
  updateAndDrawBullets();
  
  drawCharacter('player1', width/3);
  drawCharacter('player2', 2 * width/3);

  // 檢查遊戲結束
  checkGameOver();
}

// 添加炸彈更新和繪製函數
function updateAndDrawBullets() {
  for (let i = bullets.player1.length - 1; i >= 0; i--) {
    if (bullets.player1[i].update()) {
      bullets.player1.splice(i, 1);
    } else {
      bullets.player1[i].draw();
    }
  }
  
  for (let i = bullets.player2.length - 1; i >= 0; i--) {
    if (bullets.player2[i].update()) {
      bullets.player2.splice(i, 1);
    } else {
      bullets.player2[i].draw();
    }
  }
}
  // 更新和繪製玩家2的炸彈
  for (let i = bombs.player2.length - 1; i >= 0; i--) {
    if (bombs.player2[i].update()) {
      bombs.player2.splice(i, 1);  // 移除已完成爆炸的炸彈
    } else {
      bombs.player2[i].draw();
    }
  }
  function checkGameOver() {
    if (health.player1 <= 0 || health.player2 <= 0) {
      push();
      textAlign(CENTER, CENTER);
      textSize(50);
      fill(0);
      if (health.player1 <= 0) {
        text("玩家2獲勝！", width/2, height/2);
      } else {
        text("玩家1獲勝！", width/2, height/2);
      }
      pop();
      noLoop(); // 停止遊戲
    }
  }
function displayControls() {
  fill(255, 255, 255, 200);
  noStroke();
  rect(windowWidth * 0.01, windowHeight * 0.01, windowWidth * 0.3, windowHeight * 0.15);  // 增加高度
  
  fill(0);
  textSize(windowWidth * 0.02);
  textAlign(LEFT, TOP);
  text('玩家1控制: 1: 站立  2: 走路  3: 跳躍  Q: 放置炸彈', windowWidth * 0.02, windowHeight * 0.02);
  text('玩家2控制: 4: 站立  5: 走路  6: 跳躍  P: 放置炸彈', windowWidth * 0.02, windowHeight * 0.05);
  text('F: 全螢幕', windowWidth * 0.02, windowHeight * 0.08);
  text('炸彈會在幾秒後自動爆炸', windowWidth * 0.02, windowHeight * 0.11);
}

function drawGround() {
  stroke(0);
  strokeWeight(2);
  let lineWidth = 3000;
  let lineY = height/2 + 100;
  line(width/2 - lineWidth/2, lineY, width/2 + lineWidth/2, lineY);
}

function drawCharacter(player, xPos) {
  let currentAnim = currentAnimation[player];
  let currentFrame = frameIndex[player];
  let data = animationData[player][currentAnim];
  
  push();
  translate(xPos, height/2);
  
  // 為player2添加水平翻轉
  if (player === 'player2') {
    scale(-data.scale, data.scale);  // 水平翻轉
  } else {
    scale(data.scale);
  }
  
  image(
    animations[player][currentAnim][currentFrame],
    0,
    0
  );
  pop();
  
  // 更新幀索引
  frameIndex[player] = (frameIndex[player] + 1) % animations[player][currentAnim].length;
}

function keyPressed() {
  // 玩家1控制
  if (key === '1') {
    currentAnimation.player1 = 0;
    frameIndex.player1 = 0;
  }
  else if (key === '2') {
    currentAnimation.player1 = 1;
    frameIndex.player1 = 0;
  }
  else if (key === '3') {
    currentAnimation.player1 = 2;
    frameIndex.player1 = 0;
  }
  
  // 玩家2控制
  else if (key === '4') {
    currentAnimation.player2 = 0;
    frameIndex.player2 = 0;
  }
  else if (key === '5') {
    currentAnimation.player2 = 1;
    frameIndex.player2 = 0;
  }
  else if (key === '6') {
    currentAnimation.player2 = 2;
    frameIndex.player2 = 0;
  }
  
  // 全螢幕控制
  else if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  if (key === 'q' || key === 'Q') {  // 玩家1發射
    let bullet = new Bullet(width/3 + 50, height/2, 'player1');
    bullets.player1.push(bullet);
  }
  else if (key === 'p' || key === 'P') {  // 玩家2發射
    let bullet = new Bullet(2 * width/3 - 50, height/2, 'player2');
    bullets.player2.push(bullet);
  }
  // 添加重新開始功能
  else if (key === 'r' || key === 'R') {
    resetGame();
  }
}
function resetGame() {
  health.player1 = 100;
  health.player2 = 100;
  bullets.player1 = [];
  bullets.player2 = [];
  loop(); // 重新開始遊戲循環
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}  