// Cuentas, sesión y paneles (todo se guarda en el navegador)
JSON.parse(localStorage.getItem("corex_prods") || "[]").forEach(p => PRODUCTOS.push(p));
let captcha = {};
const sesion = () => JSON.parse(localStorage.getItem("corex_sesion") || "null");
const usuarios = () => JSON.parse(localStorage.getItem("corex_usuarios") || "{}");
const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const aviso = t => `<p class="aviso" role="alert">${t}</p>`;

async function hash(u, c) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(u.toLowerCase() + ":" + c));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function nuevoCaptcha() {
  captcha = { a: 1 + Math.floor(Math.random() * 9), b: 1 + Math.floor(Math.random() * 9) };
  const e = document.querySelector("#cap"); if (e) e.textContent = `¿Cuánto es ${captcha.a} + ${captcha.b}?`;
}
function pintarSesion() {
  const s = sesion();
  $("#sesion").innerHTML = s ? `<a href="#panel">Mi panel (${s.usuario})</a><a href="#inicio" onclick="salir()">Salir</a>`
    : `<a href="#ingresar">Ingresar</a><a href="#registro">Crear cuenta</a>`;
}
function salir() { localStorage.removeItem("corex_sesion"); pintarSesion(); }

async function registrar(e) {
  e.preventDefault();
  const f = new FormData(e.target), u = f.get("u").trim(), k = u.toLowerCase(), us = usuarios();
  const err = m => { $("#msg").innerHTML = aviso(m); nuevoCaptcha(); };
  if (+f.get("r") !== captcha.a + captcha.b) return err("La respuesta del captcha no es correcta. Resuelve la nueva operación.");
  if (f.get("c") !== f.get("c2")) return err("Las contraseñas no coinciden.");
  if (us[k] || VENDEDORES.some(v => v.toLowerCase() === k)) return err("Ese usuario ya existe. Elige otro.");
  us[k] = { usuario: u, tipo: f.get("tipo"), hash: await hash(u, f.get("c")) };
  guardar("corex_usuarios", us); guardar("corex_sesion", { usuario: u, tipo: us[k].tipo });
  pintarSesion(); location.hash = "panel";
}
async function entrar(e) {
  e.preventDefault();
  const f = new FormData(e.target), u = usuarios()[f.get("u").trim().toLowerCase()];
  if (!u || u.hash !== await hash(u.usuario, f.get("c"))) { $("#msg").innerHTML = aviso("Usuario o contraseña incorrectos."); return; }
  guardar("corex_sesion", { usuario: u.usuario, tipo: u.tipo }); pintarSesion(); location.hash = "panel";
}

function tarjetaPedido(p, vend) {
  const its = (p.items || []).filter(i => !vend || i.vendedor === vend), env = (p.enviados || []).includes(vend);
  const mio = its.reduce((t, i) => t + i.precio * i.cant, 0) * (1 - COMISION);
  return `<div class="caja" style="margin-bottom:16px"><p><strong>${p.cod}</strong> <span class="estado">${p.estado}</span></p>
    ${its.map(i => `<div class="fila"><span>${i.cant} × ${esc(i.nombre)}</span><span>${pesos(i.precio * i.cant)}</span></div>`).join("")}
    ${vend ? `<p>Enviar a: ${esc(p.nombre)}, ${esc(p.dir)}. Tel. ${esc(p.tel)}</p>` +
      (p.estado === "Pago retenido por Corex" && !env ? `<button class="btn verde" onclick="enviar('${p.cod}')">Marcar como enviado</button>` : env && p.estado !== "Completado" ? "<p>Ya marcaste este pedido como enviado.</p>" : "") +
      (p.estado === "Completado" ? `<p>Pago liberado para ti: ${pesos(mio)} (después de la comisión de Corex).</p>` : "")
    : (p.estado === "Enviado" ? `<button class="btn verde" onclick="confirmar('${p.cod}')">Confirmar que lo recibí</button>` : "")}</div>`;
}
function enviar(cod) {
  const p = pedidos.find(x => x.cod === cod), v = sesion().usuario;
  p.enviados = p.enviados || []; if (!p.enviados.includes(v)) p.enviados.push(v);
  if ([...new Set(p.items.map(i => i.vendedor))].every(x => p.enviados.includes(x))) p.estado = "Enviado";
  guardar("corex_pedidos", pedidos); VISTAS_CUENTAS.panel();
}
function confirmar(cod) { pedidos.find(x => x.cod === cod).estado = "Completado"; guardar("corex_pedidos", pedidos); VISTAS_CUENTAS.panel(); }
function publicar(e) {
  e.preventDefault();
  const f = new FormData(e.target), p = { id: Date.now(), nombre: esc(f.get("n").trim()), cat: f.get("c"), precio: +f.get("p"), icono: f.get("i"), vendedor: sesion().usuario, estrellas: null };
  const mios = JSON.parse(localStorage.getItem("corex_prods") || "[]"); mios.push(p); guardar("corex_prods", mios); PRODUCTOS.push(p);
  VISTAS_CUENTAS.panel();
}
function borrar(id) {
  guardar("corex_prods", JSON.parse(localStorage.getItem("corex_prods") || "[]").filter(p => p.id !== id));
  PRODUCTOS.splice(PRODUCTOS.findIndex(p => p.id === id), 1); VISTAS_CUENTAS.panel();
}

const VISTAS_CUENTAS = {
  registro() {
    $("#vista").innerHTML = `<section><h2>Crear cuenta</h2><form onsubmit="registrar(event)">
      <select name="tipo" aria-label="Tipo de cuenta"><option value="comprador">Cuenta de comprador (solo compra)</option><option value="vendedor">Cuenta de vendedor (solo vende)</option></select>
      <input name="u" placeholder="Usuario (3 a 20 letras o números)" required pattern="[A-Za-z0-9_]{3,20}" title="Usa de 3 a 20 letras, números o guion bajo">
      <input name="c" type="password" placeholder="Contraseña (mínimo 6 caracteres)" required minlength="6">
      <input name="c2" type="password" placeholder="Repite la contraseña" required>
      <div class="fila"><strong id="cap"></strong><button type="button" class="btn sec" onclick="nuevoCaptcha()">Otra operación</button></div>
      <input name="r" type="number" placeholder="Tu respuesta" required>
      <button class="btn">Crear cuenta</button><div id="msg"></div></form>
      <p style="margin-top:16px">¿Ya tienes cuenta? <a href="#ingresar"><u>Ingresa aquí</u></a>.</p></section>`;
    nuevoCaptcha();
  },
  ingresar() {
    $("#vista").innerHTML = `<section><h2>Ingresar</h2><form onsubmit="entrar(event)">
      <input name="u" placeholder="Usuario" required><input name="c" type="password" placeholder="Contraseña" required>
      <button class="btn">Ingresar</button><div id="msg"></div></form>
      <p style="margin-top:16px">¿No tienes cuenta? <a href="#registro"><u>Créala aquí</u></a>.</p></section>`;
  },
  panel() {
    const s = sesion(); if (!s) { location.hash = "ingresar"; return; }
    if (s.tipo === "comprador") {
      const mis = pedidos.filter(p => p.usuario === s.usuario);
      $("#vista").innerHTML = `<section><h2>Mis pedidos</h2>${mis.length ? mis.map(p => tarjetaPedido(p)).join("") : `<p>Aún no tienes pedidos. <a href="#catalogo"><u>Explora el catálogo</u></a>.</p>`}</section>`;
      return;
    }
    const mios = PRODUCTOS.filter(p => p.vendedor === s.usuario), ped = pedidos.filter(p => (p.items || []).some(i => i.vendedor === s.usuario));
    $("#vista").innerHTML = `<section><h2>Publicar un producto</h2><form onsubmit="publicar(event)">
      <input name="n" placeholder="Nombre del producto" required maxlength="60">
      <select name="c" aria-label="Categoría">${CATEGORIAS.map(c => `<option>${c}</option>`).join("")}</select>
      <input name="p" type="number" min="1000" step="500" placeholder="Precio en pesos" required>
      <select name="i" aria-label="Dibujo">${Object.keys(ICONOS).map(k => `<option>${k}</option>`).join("")}</select>
      <button class="btn verde">Publicar producto</button></form></section>
      <section class="oscura"><h2>Mis productos</h2><div class="caja">${mios.length ? mios.map(p => `<div class="fila"><span>${p.nombre} · ${pesos(p.precio)}</span><button class="btn sec" onclick="borrar(${p.id})">Quitar</button></div>`).join("") : "<p>Aún no has publicado productos.</p>"}</div></section>
      <section><h2>Pedidos por enviar</h2>${ped.length ? ped.map(p => tarjetaPedido(p, s.usuario)).join("") : "<p>Todavía no tienes pedidos.</p>"}</section>`;
  }
};
