// Grupos del blog, detalle de producto, perfil de vendedor y reseñas
const SEMILLA_GRUPOS = [
  { id: 1, nombre: "Arduino para principiantes", tema: "Primeros proyectos con Arduino, LEDs y sensores.", creador: "Corex", miembros: [], mensajes: [] },
  { id: 2, nombre: "Hardware y rendimiento", tema: "Procesadores, tarjetas gráficas y memoria RAM.", creador: "Corex", miembros: [], mensajes: [] },
  { id: 3, nombre: "Videojuegos y ofertas", tema: "Recomendaciones y novedades de videojuegos.", creador: "Corex", miembros: [], mensajes: [] }
];
const DESC = {
  "Hardware": "Componente nuevo para armar o mejorar tu computador. Compatible con los estándares más usados.",
  "Software": "Licencia digital con entrega inmediata del código de activación por parte del vendedor.",
  "Videojuegos": "Código digital listo para canjear en tu plataforma de juego favorita.",
  "Electrónica básica": "Componente de electrónica para tus prácticas, reparaciones y proyectos.",
  "Circuitos básicos": "Material para armar circuitos y prototipos: ideal para aprender y experimentar."
};
const G = () => JSON.parse(localStorage.getItem("corex_grupos") || "null") || SEMILLA_GRUPOS;
const gg = x => guardar("corex_grupos", x);
const R = () => JSON.parse(localStorage.getItem("corex_resenas") || "[]");
const enlaceVend = v => `<a href="#vendedor/${encodeURIComponent(v)}"><u>${v}</u></a>`;

function estrellasDe(p) {
  const r = R().filter(x => x.pid === p.id);
  if (r.length) return `★ ${(r.reduce((t, x) => t + x.e, 0) / r.length).toFixed(1)} (${r.length} reseñas)`;
  return p.estrellas ? "★ " + p.estrellas : "Nuevo";
}
function dato(k) {
  const s = sesion(); if (!s) return "";
  const o = [...pedidos].reverse().find(p => p.usuario === s.usuario);
  return o ? esc(o[k]) : "";
}
const puedeResenar = p => { const s = sesion(); return s && s.tipo === "comprador" && pedidos.some(o => o.usuario === s.usuario && o.estado === "Completado" && (o.items || []).some(i => i.nombre === p.nombre && i.vendedor === p.vendedor)); };
const listaResenas = rs => rs.length ? rs.map(r => `<div class="caja" style="margin-bottom:12px"><strong>${r.u}</strong> · ${"★".repeat(r.e)}<p>${r.t}</p></div>`).join("") : "<p>Aún no hay reseñas.</p>";

function enviarResena(e, id) {
  e.preventDefault();
  const f = new FormData(e.target), u = sesion().usuario;
  const rs = R().filter(x => !(x.pid === id && x.u === u)); rs.push({ pid: id, u, e: +f.get("e"), t: esc(f.get("t").trim()) });
  guardar("corex_resenas", rs); VISTAS_COMUNIDAD.producto(id);
}
function crearGrupo(e) {
  e.preventDefault();
  const f = new FormData(e.target), gs = G(), id = Date.now(), u = sesion().usuario;
  gs.push({ id, nombre: esc(f.get("n").trim()), tema: esc(f.get("t").trim()), creador: u, miembros: [u], mensajes: [] });
  gg(gs); location.hash = "grupo/" + id;
}
function cambiarMembresia(id, unir) {
  const gs = G(), g = gs.find(x => x.id === id), u = sesion().usuario;
  g.miembros = g.miembros.filter(x => x !== u); if (unir) g.miembros.push(u);
  gg(gs); VISTAS_COMUNIDAD.grupo(id);
}
function enviarMsg(e, id) {
  e.preventDefault();
  const gs = G(), g = gs.find(x => x.id === id);
  g.mensajes.push({ u: sesion().usuario, t: esc(new FormData(e.target).get("t").trim()), f: new Date().toLocaleDateString("es-CO") });
  gg(gs); VISTAS_COMUNIDAD.grupo(id);
}

const VISTAS_COMUNIDAD = {
  blog() {
    const s = sesion();
    $("#vista").innerHTML = `<section><h2>Blog de Corex</h2><div class="rejilla">${ARTICULOS.map(a => `<article class="tarjeta"><div class="cuerpo"><h3>${a.titulo}</h3><p>${a.texto}</p></div></article>`).join("")}</div></section>
    <section class="oscura"><h2>Grupos de conversación</h2><div class="rejilla">${G().map(g => `<a class="presu" href="#grupo/${g.id}"><h3>${g.nombre}</h3><p>${g.tema}</p><p>${g.miembros.length} miembros · ${g.mensajes.length} mensajes</p></a>`).join("")}</div>
    ${s ? `<h3 style="margin:28px 0 12px">Crea un grupo nuevo</h3><form onsubmit="crearGrupo(event)"><input name="n" placeholder="Nombre del grupo" required maxlength="40"><input name="t" placeholder="¿De qué se habla?" required maxlength="100"><button class="btn mag">Crear grupo</button></form>` : `<p style="margin-top:20px">Ingresa con tu cuenta para unirte o crear grupos.</p>`}</section>`;
  },
  grupo(id) {
    const g = G().find(x => x.id === +id); if (!g) { location.hash = "blog"; return; }
    const s = sesion(), m = s && g.miembros.includes(s.usuario);
    $("#vista").innerHTML = `<section><a href="#blog"><u>Volver al blog</u></a><h2 style="margin-top:12px">${g.nombre}</h2><p>${g.tema}</p><p class="vend">${g.miembros.length} miembros · creado por ${g.creador}</p>
    ${!s ? `<p>Para participar, <a href="#ingresar"><u>ingresa</u></a> o <a href="#registro"><u>crea una cuenta</u></a>.</p>` : m ? `<button class="btn sec" onclick="cambiarMembresia(${g.id},false)">Salir del grupo</button>` : `<button class="btn verde" onclick="cambiarMembresia(${g.id},true)">Unirme al grupo</button>`}
    <div style="margin-top:24px">${g.mensajes.length ? g.mensajes.map(x => `<div class="mensaje"><strong>${x.u}</strong> <span class="vend">${x.f}</span><p>${x.t}</p></div>`).join("") : "<p>Todavía no hay mensajes. Escribe el primero.</p>"}</div>
    ${m ? `<form onsubmit="enviarMsg(event,${g.id})" style="margin-top:16px"><textarea name="t" rows="3" maxlength="400" required placeholder="Escribe un mensaje sobre un producto"></textarea><button class="btn">Publicar mensaje</button></form>` : ""}</section>`;
  },
  producto(id) {
    const p = PRODUCTOS.find(x => x.id === +id); if (!p) { location.hash = "catalogo"; return; }
    const s = sesion(), rs = R().filter(x => x.pid === p.id);
    $("#vista").innerHTML = `<section class="detalle"><div class="imagen grande" style="color:${COLORES[p.cat]}">${svg(p.icono)}</div>
      <div><h2>${p.nombre}</h2><p class="vend">${p.cat} · Vendedor: ${enlaceVend(p.vendedor)} · ${estrellasDe(p)}</p><p class="precio" style="margin:12px 0">${pesos(p.precio)}</p>
      <p>${DESC[p.cat]}</p><p style="margin:12px 0 20px">Pago protegido: Corex retiene tu dinero hasta que confirmes la entrega.</p>
      <button class="btn verde" onclick="agregar(${p.id})">Agregar al carrito</button> <a class="btn sec" href="#catalogo">Volver al catálogo</a></div></section>
      <section class="oscura"><h2>Reseñas</h2>${listaResenas(rs)}
      ${puedeResenar(p) ? `<form onsubmit="enviarResena(event,${p.id})" style="margin-top:20px"><select name="e" aria-label="Estrellas"><option value="5">5 estrellas</option><option value="4">4 estrellas</option><option value="3">3 estrellas</option><option value="2">2 estrellas</option><option value="1">1 estrella</option></select><textarea name="t" rows="3" maxlength="300" required placeholder="Cuenta tu experiencia con este producto"></textarea><button class="btn">Publicar reseña</button></form>` : s ? "<p style=\"margin-top:16px\">Solo puedes reseñar productos de pedidos completados con tu cuenta de comprador.</p>" : "<p style=\"margin-top:16px\">Ingresa con tu cuenta de comprador para dejar una reseña.</p>"}</section>`;
  },
  vendedor(arg) {
    const n = decodeURIComponent(arg || ""), ps = PRODUCTOS.filter(p => p.vendedor === n); if (!ps.length) { location.hash = "catalogo"; return; }
    const rs = R().filter(r => ps.some(p => p.id === r.pid));
    $("#vista").innerHTML = `<div class="hero" style="padding:70px 5vw"><h1 style="font-size:clamp(2rem,5vw,3.5rem)">${n}</h1><p>${ps.length} productos publicados · ${rs.length ? "★ " + (rs.reduce((t, r) => t + r.e, 0) / rs.length).toFixed(1) + " (" + rs.length + " reseñas)" : "Aún sin reseñas"}</p></div>
      <section><h2>Productos de ${n}</h2><div class="rejilla">${ps.map(tarjeta).join("")}</div></section>
      <section class="oscura"><h2>Reseñas de compradores</h2>${listaResenas(rs)}</section>`;
  }
};
