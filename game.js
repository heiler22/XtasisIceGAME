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

// ✅ Permitir scroll en móviles
document.body.style.overflowY = "auto";

let gnomo, objetos = [], puntaje = 0, tiempo = 20, juegoActivo = false, velocidad = 4;
let malosTotales = 0;

// --- IMÁGENES ---
const imgGnomo = new Image(); imgGnomo.src = "assets/gnomo.png";
const imgVaso = new Image(); imgVaso.src = "assets/vaso.png";
const imgMalo = new Image(); imgMalo.src = "assets/malo1.png";
const imgMalo2 = new Image(); imgMalo2.src = "assets/malo2.png";
const imgMalo3 = new Image(); imgMalo3.src = "assets/malo3.png";

// --- BOTONES ---
btnJugar.onclick = () => {
  inicio.classList.add("oculto");
  juego.classList.remove("oculto");
  musica.play();
  iniciarJuego();
};

btnReiniciar.onclick = () => location.reload();

// --- INICIO DEL JUEGO ---
function iniciarJuego() {
  gnomo = { x: canvas.width / 2 - 50, y: canvas.height - 180, w: 100, h: 150, velocidad: 25 };
  objetos = [];
  puntaje = 0;
  tiempo = 20;
  velocidad = 4;
  malosTotales = 0;
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

// --- GENERADOR DE OBJETOS ---
function generarObjetos() {
  const generador = setInterval(() => {
    if (!juegoActivo) {
      clearInterval(generador);
      return;
    }

    // 🔹 Aparecen 1 o 2 objetos por oleada
    const cantidad = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < cantidad; i++) {
      let tipo, imgUsada;

      // 🔹 55% buenos - 45% malos (hasta 30 malos en total)
      const probMalo = malosTotales < 30 ? 0.45 : 0;
      if (Math.random() < probMalo) {
        tipo = "malo";
        malosTotales++;
        const malos = [imgMalo, imgMalo2, imgMalo3];
        imgUsada = malos[Math.floor(Math.random() * malos.length)];
      } else {
        tipo = "bueno";
        imgUsada = imgVaso;
      }

      objetos.push({
        x: Math.random() * (canvas.width - 60),
        y: -80,
        w: 60,
        h: 60,
        tipo,
        img: imgUsada,
        velocidadY: velocidad + Math.random() * 1.5,
        velocidadX: Math.random() > 0.5 ? (Math.random() * 1.5 - 0.75) : 0
      });
    }

    // 🔹 Control de saturación en pantalla
    if (objetos.length > 30) objetos.splice(0, objetos.length - 30);

    // 🔹 Dificultad progresiva
    if (puntaje > 50) velocidad = 5;
    if (puntaje > 100) velocidad = 6;
    if (puntaje > 150) velocidad = 7;
  }, 700);
}

// --- ACTUALIZACIÓN DEL JUEGO ---
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
      if (obj.tipo === "bueno") {
        puntaje += 10;
        velocidad += 0.1;
      } else {
        puntaje -= 10; // 💀 ahora solo resta 10 puntos
        velocidad += 0.15;
      }
      objetos.splice(i, 1);
    }
  });

  objetos = objetos.filter(o => o.y < canvas.height);
  document.getElementById("puntaje").innerText = puntaje;
  document.getElementById("tiempo").innerText = tiempo;
  requestAnimationFrame(actualizar);
}

// --- DETECCIÓN DE COLISIÓN ---
function colision(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- FINAL DEL JUEGO ---
function finalizarJuego() {
  juegoActivo = false;
  juego.classList.add("oculto");
  final.classList.remove("oculto");

  let mensaje = "¡Sigue practicando!";
  if (puntaje >= 150) mensaje = "🔥 ¡Eres una leyenda Xtasis! 🔥";
  else if (puntaje >= 100) mensaje = "🍸 ¡Premio sorpresa desbloqueado!";
  else if (puntaje >= 50) mensaje = "¡Buen intento! 💪 Sigue subiendo tu puntaje.";

  document.getElementById("mensaje-final").innerText = mensaje;
}

/* --- CONTROLES --- */
window.addEventListener("mousemove", e => {
  gnomo.x += (e.clientX - (gnomo.x + gnomo.w / 2)) * 0.15;
});
window.addEventListener("touchmove", e => {
  const touch = e.touches[0];
  gnomo.x += (touch.clientX - (gnomo.x + gnomo.w / 2)) * 0.15;
});
