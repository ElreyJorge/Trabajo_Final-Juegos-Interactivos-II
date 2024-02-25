var juego = new Phaser.Game(370, 550, Phaser.CANVAS, 'escenario');
var fondoJuego;
var heroe;
var teclaDerecha;
var teclaIzquierda;
var teclaArriba;
var teclaAbajo;
var balas;
var tiempoBala = 0;
var botonDisparo;
var puntaje = 0;
var vidas = 3;
var nivel = 1;
var nivelText;
var puntajeText;
var vidasText;
var enemigos;
var laserSound;
var reiniciarBtn;
var fondoMusica;

var estadoInicio = {
  preload: function () {
    juego.load.image('portada', 'img/portada.png');
    juego.load.image('botonPlay', 'img/boton_play.png');
  },
  create: function () {
    fondoJuego = juego.add.tileSprite(0, 0, 370, 550, 'portada');
    var botonPlay = juego.add.button(juego.world.centerX, 100, 'botonPlay', this.iniciarJuego, this, 1, 0, 2);
    botonPlay.scale.setTo(1.5, 1.5);
    botonPlay.anchor.setTo(0.5);
  },
  iniciarJuego: function () {
    juego.state.start('principal');
  }
};

var estadoPrincipal = {
  preload: function () {
    juego.load.image('mapa1', 'img/mapa1.png');
    juego.load.image('mapa2', 'img/mapa2.png');
    juego.load.image('mapa3', 'img/mapa3.png');
    juego.load.image('mapa4', 'img/mapa4.png');
    juego.load.spritesheet('heroe', 'img/heroe.png', 128, 128);
    juego.load.spritesheet('enemigo01', 'img/enemigo01.png', 192, 32);
    juego.load.spritesheet('enemigo02', 'img/enemigo02.png', 192, 32);
    juego.load.spritesheet('enemigo03', 'img/enemigo03.png', 192, 32);
    juego.load.spritesheet('enemigo04', 'img/enemigo04.png', 192, 32);
    juego.load.image('laser', 'img/laser.png');
    juego.load.image('reiniciarBtn', 'img/reiniciarBtn.png');
    juego.load.audio('laserSound', 'sound/laserSound.mp3');
    juego.load.audio('sonido1', 'sound/sonido1.mp3');
    juego.load.audio('sonido2', 'sound/sonido2.mp3');
    juego.load.audio('sonido3', 'sound/sonido3.mp3');
    juego.load.audio('sonido4', 'sound/sonido4.mp3');
  },
  create: function () {
    fondoMusica = juego.add.audio('sonido' + nivel);
    fondoMusica.loop = true;
    fondoMusica.play();

    fondoJuego = juego.add.tileSprite(0, 0, 370, 550, 'mapa1');

    nivelText = juego.add.text(16, 16, 'Nivel: ' + nivel, { fontSize: '32px', fill: '#fff' });
    puntajeText = juego.add.text(16, 50, 'Puntaje: ' + puntaje, { fontSize: '24px', fill: '#fff' });
    vidasText = juego.add.text(16, 84, 'Vidas: ' + vidas, { fontSize: '24px', fill: '#fff' });

    heroe = juego.add.sprite(200, 410, 'heroe');
    heroe.animations.add('movimiento', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 10, true);
    juego.physics.enable(heroe, Phaser.Physics.ARCADE);
    heroe.body.collideWorldBounds = true;

    botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    teclaArriba = juego.input.keyboard.addKey(Phaser.Keyboard.UP);
    teclaAbajo = juego.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    laserSound = juego.add.audio('laserSound');

    balas = juego.add.group();
    balas.enableBody = true;
    balas.physicsBodyType = Phaser.Physics.ARCADE;
    balas.createMultiple(20, 'laser');
    balas.setAll('anchor.x', 0.5);
    balas.setAll('anchor.y', 1);
    balas.setAll('outOfBoundsKill', true);
    balas.setAll('checkWorldBounds', true);

    reiniciarBtn = juego.add.button(juego.world.centerX, 500, 'reiniciarBtn', this.reiniciarJuego, this, 1, 0, 2);
    reiniciarBtn.visible = false;
    reiniciarBtn.scale.setTo(1.5, 1.5);
    reiniciarBtn.anchor.setTo(0.5);

    this.crearEnemigos();
  },
  update: function () {
    fondoJuego.tilePosition.x -= 1;

    heroe.body.velocity.setTo(0, 0);

    if (teclaDerecha.isDown) {
      heroe.body.velocity.x = 150;
      heroe.animations.play('movimiento');
    } else if (teclaIzquierda.isDown) {
      heroe.body.velocity.x = -150;
      heroe.animations.play('movimiento');
    }

    if (teclaArriba.isDown) {
      heroe.body.velocity.y = -150;
      heroe.animations.play('movimiento');
    } else if (teclaAbajo.isDown) {
      heroe.body.velocity.y = 150;
      heroe.animations.play('movimiento');
    }

    if (heroe.body.velocity.x === 0 && heroe.body.velocity.y === 0) {
      heroe.animations.stop();
      heroe.frame = 0;
    }

    var bala;
    if (botonDisparo.isDown && juego.time.now > tiempoBala) {
      bala = balas.getFirstExists(false);

      if (bala) {
        bala.reset(heroe.x + heroe.width / 2, heroe.y);
        bala.body.velocity.y = -300;
        tiempoBala = juego.time.now + 100;
        laserSound.play();
      }
    }

    juego.physics.arcade.overlap(balas, enemigos, this.colision, null, this);
    juego.physics.arcade.overlap(heroe, enemigos, this.colisionEnemigo, null, this);

    puntajeText.text = 'Puntaje: ' + puntaje;
    vidasText.text = 'Vidas: ' + vidas;

    if (puntaje >= 3 && nivel === 1) {
      nivel = 2;
      vidas++;
      fondoMusica.stop();
      fondoMusica = juego.add.audio('sonido' + nivel);
      fondoMusica.loop = true;
      fondoMusica.play();
      this.actualizarNivel();
      this.cambiarMapa('mapa2');
      this.crearEnemigos();
    } else if (puntaje >= 6 && nivel === 2) {
      nivel = 3;
      vidas++;
      fondoMusica.stop();
      fondoMusica = juego.add.audio('sonido' + nivel);
      fondoMusica.loop = true;
      fondoMusica.play();
      this.actualizarNivel();
      this.cambiarMapa('mapa3');
      this.crearEnemigos();
    } else if (puntaje >= 9 && nivel === 3) {
      nivel = 4;
      vidas++;
      fondoMusica.stop();
      fondoMusica = juego.add.audio('sonido' + nivel);
      fondoMusica.loop = true;
      fondoMusica.play();
      this.actualizarNivel();
      this.cambiarMapa('mapa4');
      this.crearEnemigos();
      reiniciarBtn.visible = true;
      reiniciarBtn.bringToTop();
    }
  },
  crearEnemigos: function () {
    if (enemigos) {
      enemigos.destroy(true, true);
    }

    enemigos = juego.add.group();
    enemigos.enableBody = true;
    enemigos.physicsBodyType = Phaser.Physics.ARCADE;

    var enemigoKey;
    switch (nivel) {
      case 1:
        enemigoKey = 'enemigo01';
        break;
      case 2:
        enemigoKey = 'enemigo02';
        break;
      case 3:
        enemigoKey = 'enemigo03';
        break;
      case 4:
        enemigoKey = 'enemigo04';
        break;
      default:
        enemigoKey = 'enemigo01';
    }

    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        var eneg = enemigos.create(x * 100, y * 100, enemigoKey);
        eneg.anchor.setTo(0.5);
        eneg.scale.setTo(1.5, 1.5);
        eneg.body.velocity.x = this.getRandomVelocity() * nivel;
        eneg.body.velocity.y = this.getRandomVelocity() * nivel;
      }
    }
    enemigos.x = 100;
    enemigos.y = 100;

    var animacion = juego.add.tween(enemigos).to(
      { x: 200 },
      1000, Phaser.Easing.Linear.None, true, 0, 1000, true
    );
  },
  colision: function (bala, enemigo) {
    bala.kill();
    enemigo.kill();
    puntaje++;
  },
  colisionEnemigo: function (heroe, enemigo) {
    enemigo.kill();
    vidas--;
    if (vidas <= 0) {
      this.mostrarResultados();
      this.reiniciarJuego();
    }
  },
  actualizarNivel: function () {
    nivelText.text = 'Nivel: ' + nivel;
  },
  cambiarMapa: function (mapaKey) {
    fondoJuego.loadTexture(mapaKey);
  },
  reiniciarJuego: function () {
    puntaje = 0;
    nivel = 1;
    vidas = 3;
    reiniciarBtn.visible = false;
    fondoMusica.stop();
    fondoMusica = juego.add.audio('sonido' + nivel);
    fondoMusica.loop = true;
    fondoMusica.play();
    this.actualizarNivel();
    this.cambiarMapa('mapa1');
    this.crearEnemigos();
  },
  mostrarResultados: function () {
    console.log('Resultados Finales');
    console.log('Puntaje final: ' + puntaje);
    console.log('Vidas restantes: ' + vidas);
  },
  getRandomVelocity: function () {
    return (Math.random() * 50) - 25;
  }
};

juego.state.add('inicio', estadoInicio);
juego.state.add('principal', estadoPrincipal);
juego.state.start('inicio');
