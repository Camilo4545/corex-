const $ = s => document.querySelector(s);
const pesos = n => "$" + n.toLocaleString("es-CO");
const leer = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
let carrito = leer("corex_carrito", []);
let pedidos = leer("corex_pedidos", []);
const COMISION = 0.08;

function actualizarCuenta() {
  $("#cuenta").textContent = carrito.reduce((t, i) => t + i.cant, 0);
  guardar("corex_carrito", carrito);
}
function tarjeta(p) {
  return `<article class="tarjeta"><div class="imagen" style="color:${COLORES[p.cat]}">${svg(p.icono)}</div><div class="cuerpo">
    <h3><a href="#producto/${p.id}">${p.nombre}</a></h3><span class="vend">Vendedor: ${enlaceVend(p.vendedor)} · ${estrellasDe(p)}</span>
    <span class="precio">${pesos(p.precio)}</span>
    <button class="btn verde" onclick="agregar(${p.id})">Agregar al carrito</button></div></article>`;
}
function agregar(id) {
  const x = carrito.find(i => i.id === id);
  x ? x.cant++ : carrito.push({ id, cant: 1 });
  actualizarCuenta();
}
function quitar(id) { carrito = carrito.filter(i => i.id !== id); actualizarCuenta(); vistas.carrito(); }

const vistas = {
  inicio() {
    $("#vista").innerHTML = `
    <div class="hero"><h1>Tecnología con pago protegido</h1>
      <p>Compra hardware, software, videojuegos y componentes electrónicos. Corex retiene tu dinero hasta que recibes el producto.</p>
      <a class="btn" href="#catalogo">Ver catálogo</a></div>
    <section><h2>Compra según tu presupuesto</h2><div class="rejilla">
      ${PRESUPUESTOS.map((r, i) => `<a class="presu" href="#catalogo/p${i}">${r.nombre}</a>`).join("")}</div></section>
    <section class="oscura"><h2>Explora por categoría</h2><div class="rejilla">
      ${CATEGORIAS.map((c, i) => `<a class="presu" href="#catalogo/c${i}">${c}</a>`).join("")}</div></section>
    <section><h2>Productos populares</h2><div class="rejilla">
      ${PRODUCTOS.filter(p => p.estrellas >= 4.8).slice(0, 8).map(tarjeta).join("")}</div></section>`;
  },
  catalogo(arg = "") {
    $("#vista").innerHTML = `<section><h2>Catálogo</h2><div class="filtros">
      <input id="q" placeholder="Buscar producto" aria-label="Buscar producto">
      <select id="fc"><option value="">Todas las categorías</option>${CATEGORIAS.map((c, i) => `<option value="${i}">${c}</option>`).join("")}</select>
      <select id="fp"><option value="">Todos los presupuestos</option>${PRESUPUESTOS.map((r, i) => `<option value="${i}">${r.nombre}</option>`).join("")}</select>
      <input id="mn" type="number" min="0" placeholder="Mínimo ($)" style="width:130px"><input id="mx" type="number" min="0" placeholder="Máximo ($)" style="width:130px">
      </div><div class="rejilla" id="lista"></div></section>`;
    if (arg[0] === "c") $("#fc").value = arg.slice(1);
    if (arg[0] === "p") $("#fp").value = arg.slice(1);
    const filtrar = () => {
      const q = $("#q").value.toLowerCase(), c = $("#fc").value, p = $("#fp").value;
      const mn = +$("#mn").value || 0, mx = +$("#mx").value || Infinity;
      const r = p !== "" ? PRESUPUESTOS[p] : { min: 0, max: Infinity };
      const res = PRODUCTOS.filter(x => x.nombre.toLowerCase().includes(q) &&
        (c === "" || x.cat === CATEGORIAS[c]) && x.precio >= Math.max(r.min, mn) && x.precio <= Math.min(r.max, mx));
      $("#lista").innerHTML = res.length ? res.map(tarjeta).join("") : "<p>No hay productos con esos filtros. Prueba ampliar el presupuesto.</p>";
    };
    document.querySelectorAll(".filtros input,.filtros select").forEach(e => e.oninput = filtrar);
    filtrar();
  },
  carrito() {
    const total = carrito.reduce((t, i) => t + PRODUCTOS.find(p => p.id === i.id).precio * i.cant, 0);
    $("#vista").innerHTML = `<section><h2>Tu carrito</h2>` + (carrito.length ? `<div class="caja">
      ${carrito.map(i => { const p = PRODUCTOS.find(x => x.id === i.id); return `<div class="fila"><span>${i.cant} × ${p.nombre}</span><span>${pesos(p.precio * i.cant)} <button onclick="quitar(${p.id})" aria-label="Quitar">✕</button></span></div>`; }).join("")}
      <div class="fila"><strong>Total</strong><strong>${pesos(total)}</strong></div></div>
      <h2 style="margin-top:36px">Datos de envío (sin crear cuenta)</h2>
      <form onsubmit="pagar(event,${total})"><input name="nombre" value="${dato("nombre")}" placeholder="Nombre completo" required>
      <input name="tel" value="${dato("tel")}" placeholder="Teléfono" required pattern="[0-9]{7,10}" title="Escribe solo números">
      <input name="dir" value="${dato("dir")}" placeholder="Dirección de envío" required>
      <button class="btn mag">Pagar con Nequi</button></form>` : `<p>Tu carrito está vacío. <a href="#catalogo"><u>Explora el catálogo</u></a>.</p>`) + `</section>`;
  },
  rastrear() {
    $("#vista").innerHTML = `<section><h2>Rastrear mi pedido</h2><form onsubmit="buscar(event)">
      <input name="cod" placeholder="Código del pedido (ej. CRX-48213)" required>
      <input name="tel" value="${dato("tel")}" placeholder="Teléfono usado en la compra" required>
      <button class="btn">Buscar pedido</button></form><div id="res" style="margin-top:28px"></div></section>`;
  },
  acerca() {
    $("#vista").innerHTML = `<div class="hero"><h1>Comprar tecnología sin miedo</h1><p>Corex conecta a quienes venden con quienes compran y cuida el dinero de ambos hasta que el producto llega a sus manos.</p></div>
    <section class="texto"><h2>Qué es Corex</h2><p>Corex es un mercado en línea de tecnología donde vendedores independientes publican hardware, software, videojuegos, componentes de electrónica y material para armar circuitos. Nosotros somos el intermediario: verificamos que el pago exista, lo retenemos y solo lo entregamos al vendedor cuando el comprador confirma que recibió su pedido.</p>
    <h2>El problema que resolvemos</h2><p>Comprar tecnología entre particulares genera desconfianza: el comprador teme pagar y no recibir, y el vendedor teme enviar y no cobrar. Corex elimina ese riesgo para las dos partes.</p>
    <h2>Nuestro objetivo en el mercado</h2><p>Queremos ser el lugar de confianza para comprar y vender tecnología en Colombia, desde un LED de mil pesos hasta una tarjeta gráfica, con precios claros en pesos y pago por Nequi.</p></section>
    <section class="oscura"><div class="rejilla"><div class="presu"><h3>Misión</h3><p>Facilitar compras y ventas de tecnología seguras, rápidas y transparentes, protegiendo el pago de cada operación.</p></div>
    <div class="presu"><h3>Visión</h3><p>Ser, en los próximos años, la plataforma colombiana de referencia para el comercio de tecnología y electrónica entre vendedores y compradores.</p></div>
    <div class="presu"><h3>Valores</h3><p>Confianza, transparencia, acceso para todos los presupuestos y respeto por quien compra y por quien vende.</p></div></div></section>`;
  },
  blog() {
    $("#vista").innerHTML = `<section><h2>Blog de Corex</h2><div class="rejilla">${ARTICULOS.map(a =>
      `<article class="tarjeta"><div class="cuerpo"><h3>${a.titulo}</h3><p>${a.texto}</p></div></article>`).join("")}</div></section>`;
  }
};

function pagar(e, total) {
  e.preventDefault();
  if (sesion() && sesion().tipo === "vendedor") { $("#vista").innerHTML = `<section><h2>Cuenta de vendedor</h2><div class="caja"><p>Las cuentas de vendedor solo venden. Cierra sesión o ingresa con una cuenta de comprador para pagar.</p></div></section>`; return; }
  const f = new FormData(e.target), cod = "CRX-" + Math.floor(10000 + Math.random() * 90000);
  const celdas = Array.from({ length: 441 }, () => `<i class="${Math.random() > .5 ? "n" : ""}"></i>`).join("");
  $("#vista").innerHTML = `<section><h2>Paga con Nequi</h2><div class="caja">
    <p>Escanea este código QR desde tu app Nequi y paga <strong>${pesos(total)}</strong>.</p>
    <div class="qr">${celdas}</div><p class="vend">QR simulado para la demostración.</p>
    <button class="btn verde" id="ya">Ya pagué</button></div></section>`;
  $("#ya").onclick = () => {
    const items = carrito.map(i => { const q = PRODUCTOS.find(x => x.id === i.id); return { nombre: q.nombre, precio: q.precio, cant: i.cant, vendedor: q.vendedor }; });
    pedidos.push({ cod, items, enviados: [], usuario: sesion() ? sesion().usuario : null, tel: f.get("tel"), nombre: f.get("nombre"), dir: f.get("dir"), total, estado: "Pago retenido por Corex" });
    guardar("corex_pedidos", pedidos); carrito = []; actualizarCuenta();
    $("#vista").innerHTML = `<section><h2>¡Pago recibido!</h2><div class="caja"><p>Corex retiene tu dinero hasta que confirmes la entrega.</p>
      <p>Tu código de pedido es <strong>${cod}</strong>. Guárdalo para rastrearlo con tu teléfono.</p>
      <a class="btn" href="#rastrear">Rastrear mi pedido</a></div></section>`;
  };
}
function buscar(e) {
  e.preventDefault();
  const f = new FormData(e.target), p = pedidos.find(x => x.cod === f.get("cod").toUpperCase().trim() && x.tel === f.get("tel").trim());
  window.pedidoActual = p;
  mostrarPedido();
}
function mostrarPedido() {
  const p = window.pedidoActual, r = $("#res");
  if (!p) { r.innerHTML = "<p>No encontramos ese pedido. Revisa el código y el teléfono.</p>"; return; }
  const libre = p.total * (1 - COMISION);
  r.innerHTML = `<div class="caja"><p><strong>${p.cod}</strong> · ${pesos(p.total)}</p>
    <p>Estado: <span class="estado">${p.estado}</span></p>
    ${p.estado === "Pago retenido por Corex" ? "<p>Esperando que el vendedor envíe tu pedido.</p>" : ""}
    ${p.estado === "Enviado" ? `<button class="btn verde" onclick="cambiar('Completado')">Confirmar que lo recibí</button>` : ""}
    ${p.estado === "Completado" ? `<p>Pago liberado al vendedor: ${pesos(libre)} (comisión de Corex: ${pesos(p.total - libre)}).</p>` : ""}</div>`;
}
function cambiar(estado) { window.pedidoActual.estado = estado; guardar("corex_pedidos", pedidos); mostrarPedido(); }

Object.assign(vistas, VISTAS_CUENTAS, VISTAS_COMUNIDAD);
function ruta() {
  const [v, arg] = (location.hash.slice(1) || "inicio").split("/");
  (vistas[v] || vistas.inicio)(arg); scrollTo(0, 0);
}
addEventListener("hashchange", ruta);
pintarSesion(); actualizarCuenta(); ruta();
