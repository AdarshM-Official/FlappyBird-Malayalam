const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-container',   // optional div id
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
let startscreen;
let gameStarted = false;
let gameend;


function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('gameover', 'assets/gameover.png');
    this.load.image('bird', 'assets/bird.png');
    this.load.image('start', 'assets/start.png');
    this.load.audio('tap', 'assets/tap.mp3');
    this.load.audio('hit', 'assets/hit.mp3');
    this.load.audio('point', 'assets/point.mp3');
    this.load.image('gameend', 'assets/gameover.jpg');
}

function create() {

    this.add.image(200, 300, 'background');

    pipes = this.physics.add.group();

    bird = this.physics.add.sprite(100, 300, 'bird');
    bird.setCollideWorldBounds(false);
    bird.body.allowGravity = false;
    bird.setVelocity(0);

    ground = this.physics.add.staticGroup();
    ground.create(200, 590, 'ground');

    this.physics.add.collider(bird, ground, endGame, null, this);
    this.physics.add.collider(bird, pipes, endGame, null, this);

    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '28px',
        fill: '#fff'
    });

    this.input.on('pointerdown', jump, this);
    this.input.keyboard.on('keydown-SPACE', jump, this);

    pipeTimer = this.time.addEvent({
        delay: 1500,
        callback: addPipe,
        callbackScope: this,
        loop: true,
        paused: true   // 🔥 start paused
    });
    startScreen = this.add.image(200, 300, 'start');
    startScreen.setDepth(10);
}

function update() {
if (!gameStarted || gameOver) return;

    bird.rotation = bird.body.velocity.y / 300;

    pipes.getChildren().forEach(pipe => {
        if (pipe.x < -50) {
            pipe.destroy();
            score=score+1;
            this.sound.play('point');
            scoreText.setText('Score: ' + score);
        }
    });
}

function jump() {

    if (!gameStarted) {
        gameStarted = true;

        startScreen.destroy();          // remove start image
        bird.body.allowGravity = true;  // enable gravity
        pipeTimer.paused = false;       // start spawning pipes

        bird.setVelocityY(-350);        // first jump
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

    const gap = 150;
    const topY = Phaser.Math.Between(150, 450);

    // TOP PIPE
    const topPipe = pipes.create(400, topY - gap, 'pipe')
        .setOrigin(0.5, 1)
        .setFlipY(true);

    // BOTTOM PIPE
    const bottomPipe = pipes.create(400, topY, 'pipe')
        .setOrigin(0.5, 0);

    // 🔥 VERY IMPORTANT FIX
    topPipe.body.allowGravity = false;
    bottomPipe.body.allowGravity = false;

    topPipe.setVelocityX(-200);
    bottomPipe.setVelocityX(-200);
}

function endGame() {

    if (gameOver) return;

    gameOver = true;
    this.sound.play('hit');

    // 🔥 Stop pipe spawning
    pipeTimer.paused = true;

    // 🔥 Stop all existing pipes
    pipes.getChildren().forEach(pipe => {
        pipe.setVelocityX(0);
    });

    // 🔥 Stop bird movement
    bird.setVelocity(0);
    bird.body.allowGravity = false;

    bird.setTint(0xff0000);

    this.add.text(90, 250, 'GAME OVER', {
        fontSize: '40px',
        fill: '#ff0000'
    });

    this.add.text(90, 320, 'Click to Restart', {
        fontSize: '24px',
        fill: '#ffffff'
    });
    // this.add.image(200, 300, 'gameend').setScale(2.5);
}