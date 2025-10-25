const inicio = document.getElementById("pantalla-inicio");
const juego = document.getElementById("pantalla-juego");
const final = document.getElementById("pantalla-final");
const btnJugar = document.getElementById("btn-jugar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const musica = document.getElementById("musica");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

let gnomo, objetos = [], puntaje = 0, tiempo = 20, juegoActivo = false, velocidad = 6;

const imgGnomo = new Image(); imgGnomo.src = "assets/gnomo.png";
const imgVaso = new Image(); imgVaso.src = "assets/vaso.png";
const imgMalo = new Image(); imgMalo.src = "assets/malo1.png";
const imgMalo2 = new Image(); imgMalo.src = "assets/malo2.png";
const imgMalo3 = new Image(); imgMalo.src = "assets/malo3.png";

btnJugar.onclick = () => {
  inicio.classList.add("oculto");
  juego.classList.remove("oculto");
  musica.play();
  iniciarJuego();
};

btnReiniciar.onclick = () => location.reload();

function iniciarJuego() {
  gnomo = { x: canvas.width / 2 - 50, y: canvas.height - 180, w: 100, h: 150, velocidad: 25 };
  objetos = [];
  puntaje = 0;
  tiempo = 20;
  velocidad = 6;
  juegoActivo = true;

  generarObjetos();
  actualizar();

  const intervaloTiempo = setInterval(() => {
    if (!juegoActivo) return;
    tiempo--;
    if (tiempo <= 0) {
      clearInterval(intervaloTiempo);
      finalizarJuego();
    }
  }, 1000);
}

function generarObjetos() {
  setInterval(() => {
    if (!juegoActivo) return;

    // genera de 2 a 3 objetos simultáneos
    const cantidad = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < cantidad; i++) {
      const bueno = Math.random() > 0.5;
      const malos = [imgMalo, imgMalo2, imgMalo3];
      objetos.push({
        x: Math.random() * (canvas.width - 60),
        y: -80,
        w: 60,
        h: 60,
        tipo: bueno ? "bueno" : "malo",
        img: bueno ? imgVaso : malos[Math.floor(Math.random() * malos.length)],
        velocidadY: velocidad + Math.random() * 5,
        velocidadX: Math.random() > 0.5 ? (Math.random() * 3 - 1.5) : 0 // movimiento horizontal leve
      });
    }

    // aumenta la dificultad progresivamente
    if (puntaje > 50) velocidad = 8;
    if (puntaje > 100) velocidad = 10;
    if (puntaje > 150) velocidad = 12;
    if (puntaje > 200) velocidad = 15;
  }, 400); // menos tiempo entre apariciones
}

function actualizar() {
  if (!juegoActivo) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgGnomo, gnomo.x, gnomo.y, gnomo.w, gnomo.h);

  objetos.forEach((obj, i) => {
    obj.y += obj.velocidadY;
    obj.x += obj.velocidadX;
    if (obj.x < 0 || obj.x + obj.w > canvas.width) obj.velocidadX *= -1; // rebote lateral

    ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);

    if (colision(gnomo, obj)) {
      if (obj.tipo === "bueno") {
        puntaje += 10;
        velocidad += 0.3; // más velocidad cada vez que aciertas
      } else {
        puntaje -= 10; // penalización fuerte
        velocidad += 0.5; // aún más difícil
      }
      objetos.splice(i, 1);
    }
  });

  objetos = objetos.filter(o => o.y < canvas.height);
  document.getElementById("puntaje").innerText = puntaje;
  document.getElementById("tiempo").innerText = tiempo;
  requestAnimationFrame(actualizar);
}

function colision(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function finalizarJuego() {
  juegoActivo = false;
  juego.classList.add("oculto");
  final.classList.remove("oculto");

  let mensaje = "¡Sigue practicando!";
  if (puntaje >= 150) mensaje = "🔥 ¡Eres una leyenda Xtasis! 🔥";
  else if (puntaje >= 100) mensaje = "¡Bebida premium para ti 🍸!";
  else if (puntaje >= 50) mensaje = "¡Buen intento, prueba de nuevo! 🍹";

  document.getElementById("mensaje-final").innerText = mensaje;
}

/* --- Controles --- */
window.addEventListener("mousemove", e => {
  gnomo.x += (e.clientX - (gnomo.x + gnomo.w / 2)) * 0.15; // movimiento más lento (menos control)
});
window.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  gnomo.x += (touch.clientX - (gnomo.x + gnomo.w / 2)) * 0.15;
});
