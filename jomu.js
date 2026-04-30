const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let bird;
let pipes;
let ground;
let score = 0;
let scoreText;
let gameOver = false;
let pipeTimer;
let startScreen;
let gameStarted = false;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('start', 'assets/start.png');

    this.load.audio('tap', 'assets/jtap.mp3');
    this.load.audio('hit', 'assets/jhit.mp3');
    this.load.audio('point', 'assets/point.mp3');
}

function create() {

    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, 'background');

    // Pipes group
    pipes = this.physics.add.group();

    // Bird
    bird = this.physics.add.sprite(width * 0.25, height / 2, 'bird');
    bird.setCollideWorldBounds(false);
    bird.body.allowGravity = false;
    bird.setVelocity(0);

    // Ground
    ground = this.physics.add.staticGroup();
    ground.create(width / 2, height - 10, 'ground');

    // Collisions
    this.physics.add.collider(bird, ground, endGame, null, this);
    this.physics.add.collider(bird, pipes, endGame, null, this);

    // Score text
    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '28px',
        fill: '#fff'
    });

    // Input
    this.input.on('pointerdown', jump, this);
    this.input.keyboard.on('keydown-SPACE', jump, this);

    // Pipe timer (paused until game starts)
    pipeTimer = this.time.addEvent({
        delay: 1500,
        callback: addPipe,
        callbackScope: this,
        loop: true,
        paused: true
    });

    // Start screen
    startScreen = this.add.image(width / 2, height / 2, 'start');
    startScreen.setDepth(10);
}

function update() {

    if (!gameStarted || gameOver) return;

    bird.rotation = bird.body.velocity.y / 300;

    pipes.getChildren().forEach(pipe => {
        if (pipe.x < -50) {
            pipe.destroy();
            score++;
            this.sound.play('point');
            scoreText.setText('Score: ' + score);
        }
    });
}

function jump() {

    if (!gameStarted) {
        gameStarted = true;
        startScreen.destroy();
        bird.body.allowGravity = true;
        pipeTimer.paused = false;
        bird.setVelocityY(-350);
        this.sound.play('tap');
        return;
    }

    if (gameOver) {
        location.reload();
        return;
    }

    bird.setVelocityY(-350);
    this.sound.play('tap');
}

function addPipe() {

    const { width, height } = this.scale;

    const gap = 150;
    const topY = Phaser.Math.Between(150, height - 150);

    const topPipe = pipes.create(width, topY - gap, 'pipe')
        .setOrigin(0.5, 1)
        .setFlipY(true);

    const bottomPipe = pipes.create(width, topY, 'pipe')
        .setOrigin(0.5, 0);

    topPipe.body.allowGravity = false;
    bottomPipe.body.allowGravity = false;

    topPipe.setVelocityX(-200);
    bottomPipe.setVelocityX(-200);
}

function endGame() {

    if (gameOver) return;

    gameOver = true;
    this.sound.play('hit');

    pipeTimer.paused = true;

    pipes.getChildren().forEach(pipe => {
        pipe.setVelocityX(0);
    });

    bird.setVelocity(0);
    bird.body.allowGravity = false;
    bird.setTint(0xff0000);

    const { width, height } = this.scale;

    this.add.text(width / 2 - 110, height / 2 - 40, 'GAME OVER', {
        fontSize: '40px',
        fill: '#ff0000'
    });

    this.add.text(width / 2 - 100, height / 2 + 20, 'Tap to Restart', {
        fontSize: '24px',
        fill: '#ffffff'
    });
}