const inicio = document.getElementById("pantalla-inicio");
const juego = document.getElementById("pantalla-juego");
const final = document.getElementById("pantalla-final");
const btnJugar = document.getElementById("btn-jugar");
const btnReiniciar = document.getElementById("btn-reiniciar");
const musica = document.getElementById("musica");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste responsive
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

// Scroll habilitado en inicio y final, bloqueado solo en juego
function activarScroll() {
  document.body.style.overflow = "auto";
}
function bloquearScroll() {
  document.body.style.overflow = "hidden";
}

// Variables del juego
let gnomo, objetos = [], puntaje = 0, tiempo = 20, juegoActivo = false, velocidad = 6;

// Cargar imágenes
const imgGnomo = new Image(); imgGnomo.src = "assets/gnomo.png";
const imgVaso = new Image(); imgVaso.src = "assets/vaso.png";
const malos = ["assets/malo1.png", "assets/malo2.png", "assets/malo3.png"].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

btnJugar.onclick = () => {
  bloquearScroll(); // bloquea scroll durante el juego
  inicio.classList.add("oculto");
  juego.classList.remove("oculto");
  musica.play();
  iniciarJuego();
};

btnReiniciar.onclick = () => {
  activarScroll(); // reactiva scroll al reiniciar
  location.reload();
};

// Lógica del juego
function iniciarJuego() {
  gnomo = { x: canvas.width / 2 - 50, y: canvas.height - 180, w: 100, h: 150 };
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
    const cantidad = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < cantidad; i++) {
      const bueno = Math.random() > 0.5;
      objetos.push({
        x: Math.random() * (canvas.width - 60),
        y: -80,
        w: 60,
        h: 60,
        tipo: bueno ? "bueno" : "malo",
        img: bueno ? imgVaso : malos[Math.floor(Math.random() * malos.length)],
        velocidadY: velocidad + Math.random() * 5,
        velocidadX: Math.random() > 0.5 ? (Math.random() * 3 - 1.5) : 0
      });
    }
  }, 400);
}

function actualizar() {
  if (!juegoActivo) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imgGnomo, gnomo.x, gnomo.y, gnomo.w, gnomo.h);

  objetos.forEach((obj, i) => {
    obj.y += obj.velocidadY;
    obj.x += obj.velocidadX;
    if (obj.x < 0 || obj.x + obj.w > canvas.width) obj.velocidadX *= -1;

    ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);

    if (colision(gnomo, obj)) {
      if (obj.tipo === "bueno") puntaje += 10;
      else puntaje -= 10;
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
  activarScroll(); // permite scroll de nuevo
  juegoActivo = false;
  juego.classList.add("oculto");
  final.classList.remove("oculto");

  let mensaje = "¡Sigue practicando!";
  if (puntaje >= 150) mensaje = "🔥 ¡Eres una leyenda Xtasis! 🔥";
  else if (puntaje >= 100) mensaje = "¡2x1 en Xtasis Ice! 🍸";
  else if (puntaje >= 50) mensaje = "¡10% de descuento 🍹!";

  document.getElementById("mensaje-final").innerText = mensaje;
}

/* Controles */
window.addEventListener("touchmove", e => {
  if (!juegoActivo) return;
  const touch = e.touches[0];
  gnomo.x += (touch.clientX - (gnomo.x + gnomo.w / 2)) * 0.15;
});
window.addEventListener("mousemove", e => {
  if (!juegoActivo) return;
  gnomo.x += (e.clientX - (gnomo.x + gnomo.w / 2)) * 0.15;
});
