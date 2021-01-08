let gameScene = new Phaser.Scene('Game');

gameScene.init = function () {
  this.playerSpeed = 5;
  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 5;

  this.enemyMaxY = 315;
  this.enemyMinY = 45;
};

gameScene.preload = function () {
  this.load.image('background', '../assets/background.png');
  this.load.image('player', '../assets/player.png');
  this.load.image('enemy', '../assets/dragon.png');
  this.load.image('goal', '../assets/treasure.png');
};

gameScene.create = function () {
  //bg
  let bg = this.add.sprite(0, 0, 'background');
  bg.setPosition(640 / 2, 360 / 2);

  //player
  this.player = this.add.sprite(50, this.sys.game.config.height / 2, 'player');

  //goal;
  this.goal = this.add.sprite(
    this.sys.game.config.width - 80,
    this.sys.game.config.height / 2,
    'goal',
  );
  this.goal.setScale(0.5);

  // enimies
  this.enemies = this.add.group({
    key: 'enemy',
    repeat: 5,
    setXY: {
      x: 90,
      y: 100,
      stepX: 80,
      stepY: 20,
    },
  });

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);
  Phaser.Actions.Call(this.enemies.getChildren(), function (enemy) {
    //set enimies direction
    enemy.flipX = true;

    // Set enimies speed
    let dir = Math.random() < 0.5 ? 1 : -1;
    let speed =
      this.enemyMinSpeed +
      Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
    enemy.velocity = dir * speed;
  });
};

gameScene.update = function () {
  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  }

  let playerRect = this.player.getBounds();
  let goalRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
    this.scene.restart();
  }

  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;
  for (let i = 0; i < numEnemies; i++) {
    // enemy movement
    enemies[i].y += enemies[i].velocity;

    // check we haven't passed min or max Y
    let conditionUp = enemies[i].velocity < 0 && enemies[i].y <= this.enemyMinY;
    let conditionDown =
      enemies[i].velocity > 0 && enemies[i].y >= this.enemyMaxY;

    // if we passed the upper or lower limit, reverse
    if (conditionUp || conditionDown) {
      enemies[i].velocity *= -1;
    }

    // check enemy overlap
    let enemyRect = enemies[i].getBounds();

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      // restart the Scene
      this.scene.restart();
      return;
    }
  }
};

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene,
};

let game = new Phaser.Game(config);