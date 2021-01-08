let gameScene = new Phaser.Scene('Game');

gameScene.init = function () {
  this.playerSpeed = 5;
  this.enemyMinSpeed = 2;
  this.enemyMaxSpeed = 5;

  this.enemyMaxY = 315;
  this.enemyMinY = 45;

  this.isTerminating = false;
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
  this.player.setScale(0.5);

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
      stepX: 95,
      stepY: 20,
    },
  });

  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);
  Phaser.Actions.Call(
    this.enemies.getChildren(),
    function (enemy) {
      //set enimies direction
      enemy.flipX = true;

      // Set enimies speed
      let dir = Math.random() < 0.5 ? 1 : -1;
      let speed =
        this.enemyMinSpeed +
        Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);
      enemy.velocity = dir * speed;
    },
    this,
  );
};

gameScene.update = function () {
  if (this.isTerminating) return;
  if (this.input.activePointer.isDown) {
    this.player.x += this.playerSpeed;
  }

  let playerRect = this.player.getBounds();
  let goalRect = this.goal.getBounds();

  if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, goalRect)) {
    return this.gameOver();
  }

  // get enemies
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;
  for (let i = 0; i < numEnemies; i++) {
    enemies[i].y += enemies[i].velocity;
    let conditionUp = enemies[i].velocity < 0 && enemies[i].y <= this.enemyMinY;
    let conditionDown =
      enemies[i].velocity > 0 && enemies[i].y >= this.enemyMaxY;
    if (conditionUp || conditionDown) {
      enemies[i].velocity *= -1;
    }

    let enemyRect = enemies[i].getBounds();
    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
      return this.gameOver();
    }
  }
};

gameScene.gameOver = function () {
  this.cameras.main.shake(500);
  this.cameras.main.on(
    'camerashakecomplete',
    function (camera, effect) {
      this.cameras.main.fade(500);
    },
    this,
  );
  this.cameras.main.on(
    'camerafadeoutcomplete',
    function (camera, effect) {
      this.scene.restart();
    },
    this,
  );
};

let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene,
};

let game = new Phaser.Game(config);
