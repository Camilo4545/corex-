// Categorías por tipo de producto
const CATEGORIAS = ["Hardware", "Software", "Videojuegos", "Electrónica básica", "Circuitos básicos"];
const COLORES = { "Hardware": "#00E5FF", "Software": "#9B7BFF", "Videojuegos": "#FF3DCB", "Electrónica básica": "#39FF88", "Circuitos básicos": "#FFB020" };

// Rangos de presupuesto en pesos colombianos
const PRESUPUESTOS = [
  { nombre: "Hasta $20.000", min: 0, max: 20000 },
  { nombre: "$20.000 a $50.000", min: 20000, max: 50000 },
  { nombre: "$50.000 a $150.000", min: 50000, max: 150000 },
  { nombre: "$150.000 a $500.000", min: 150000, max: 500000 },
  { nombre: "Más de $500.000", min: 500000, max: Infinity }
];

// Dibujos genéricos de productos (SVG)
const ICONOS = {
  led: '<circle cx="32" cy="24" r="12"/><path d="M20 24v10h24V24M27 34v18M37 34v14"/>',
  placa: '<rect x="8" y="14" width="48" height="36" rx="3"/><path d="M8 32h48M16 22h4M24 22h4M32 22h4M40 22h4M16 42h4M24 42h4M32 42h4M40 42h4"/>',
  chip: '<rect x="18" y="18" width="28" height="28" rx="3"/><path d="M26 10v8M38 10v8M26 46v8M38 46v8M10 26h8M10 38h8M46 26h8M46 38h8"/>',
  gpu: '<rect x="6" y="18" width="52" height="26" rx="3"/><circle cx="22" cy="31" r="7"/><circle cx="42" cy="31" r="7"/><path d="M12 50h40"/>',
  teclado: '<rect x="6" y="20" width="52" height="26" rx="3"/><path d="M14 29h4M24 29h4M34 29h4M44 29h4M14 37h36"/>',
  mouse: '<rect x="20" y="8" width="24" height="48" rx="12"/><path d="M32 8v18M20 26h24"/>',
  disco: '<rect x="12" y="10" width="40" height="44" rx="4"/><circle cx="32" cy="30" r="8"/><path d="M20 46h24"/>',
  sensor: '<rect x="10" y="22" width="44" height="22" rx="3"/><circle cx="24" cy="33" r="6"/><circle cx="40" cy="33" r="6"/><path d="M20 44v8M44 44v8"/>',
  control: '<path d="M16 24h32a10 10 0 0 1 10 12l-3 10a5 5 0 0 1-9 1l-3-5H21l-3 5a5 5 0 0 1-9-1L6 36a10 10 0 0 1 10-12z"/><path d="M20 30v6M17 33h6"/><circle cx="42" cy="31" r="1.5"/><circle cx="47" cy="36" r="1.5"/>',
  juego: '<rect x="14" y="8" width="36" height="48" rx="3"/><path d="M26 24l14 8-14 8z"/>',
  licencia: '<path d="M32 8l20 8v16c0 12-9 20-20 24C21 52 12 44 12 32V16z"/><path d="M23 32l7 7 12-14"/>',
  cable: '<path d="M8 18c16 0 8 28 24 28s8-28 24-28"/>',
  ram: '<rect x="6" y="20" width="52" height="20" rx="2"/><path d="M12 40v6M22 40v6M32 40v6M42 40v6M52 40v6M14 28h8M28 28h8M42 28h8"/>',
  resistencia: '<path d="M4 32h12l4-10 8 20 8-20 8 20 4-10h12"/>',
  monitor: '<rect x="8" y="12" width="48" height="32" rx="3"/><path d="M24 54h16M32 44v10"/>',
  audifonos: '<path d="M12 38v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="38" width="10" height="16" rx="3"/><rect x="46" y="38" width="10" height="16" rx="3"/>'
};
const svg = n => `<svg viewBox="0 0 64 64" width="72" height="72" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n]}</svg>`;

// [nombre, precio en pesos, dibujo]
const CATALOGO = {
  "Hardware": [["Mouse gamer 6400 DPI",85000,"mouse"],["Mouse inalámbrico",45000,"mouse"],["Teclado mecánico retroiluminado",240000,"teclado"],["Teclado básico USB",38000,"teclado"],["Memoria RAM 8 GB DDR4",115000,"ram"],["Memoria RAM 16 GB DDR4",210000,"ram"],["Memoria RAM 32 GB DDR5",520000,"ram"],["Disco sólido SSD 480 GB",175000,"disco"],["Disco sólido SSD 1 TB",320000,"disco"],["Disco duro externo 1 TB",280000,"disco"],["Tarjeta gráfica GTX 1650",780000,"gpu"],["Tarjeta gráfica RTX 4060",1450000,"gpu"],["Tarjeta gráfica RTX 4070",2650000,"gpu"],["Procesador Ryzen 5 5600",620000,"chip"],["Procesador Core i5 12400",710000,"chip"],["Procesador Ryzen 7 7700",1350000,"chip"],["Tarjeta madre B550",590000,"chip"],["Fuente de poder 650 W",260000,"chip"],["Monitor 24 pulgadas 120 Hz",640000,"monitor"],["Audífonos gamer con micrófono",95000,"audifonos"]],
  "Software": [["Antivirus (licencia de 1 año)",45000,"licencia"],["Windows 11 Pro",180000,"licencia"],["Windows 11 Home",140000,"licencia"],["Suite de oficina para el hogar",220000,"licencia"],["Suite de diseño gráfico (anual)",390000,"licencia"],["Editor de video profesional",450000,"licencia"],["Editor de fotos",120000,"licencia"],["Curso de programación en línea",69000,"licencia"],["Gestor de contraseñas (anual)",38000,"licencia"],["VPN de 1 año",59000,"licencia"],["Software de contabilidad",280000,"licencia"],["Programa de modelado 3D",520000,"licencia"],["Simulador de circuitos",85000,"licencia"],["Entorno de programación profesional",340000,"licencia"],["Almacenamiento en la nube 1 TB (anual)",99000,"licencia"],["Suite ofimática básica",150000,"licencia"],["Software de producción musical",360000,"licencia"],["Programa de copias de seguridad",48000,"licencia"],["Lector de PDF profesional",95000,"licencia"],["Curso de electrónica en línea",75000,"licencia"]],
  "Videojuegos": [["Juego de aventura (código digital)",98000,"juego"],["Juego de carreras (código digital)",135000,"juego"],["Fútbol 2026 (código digital)",189000,"juego"],["Juego de disparos (código digital)",159000,"juego"],["Juego de mundo abierto",210000,"juego"],["Juego de estrategia",79000,"juego"],["Plataformas independiente",32000,"juego"],["Juego de terror",69000,"juego"],["Juego de rol",175000,"juego"],["Juego de lucha",120000,"juego"],["Juego de supervivencia",55000,"juego"],["Juego de rompecabezas",18000,"juego"],["Simulador de granja",45000,"juego"],["Baloncesto 2026",165000,"juego"],["Juego de bloques y construcción",88000,"juego"],["Aventura gráfica",28000,"juego"],["Juego de cartas",15000,"juego"],["Juego cooperativo para 4 jugadores",72000,"juego"],["Control inalámbrico para PC",159000,"control"],["Volante de carreras con pedales",480000,"control"]],
  "Electrónica básica": [["Resistencias surtidas (300 piezas)",15000,"resistencia"],["Kit de capacitores electrolíticos",29000,"resistencia"],["Sensor ultrasónico HC-SR04",14000,"sensor"],["Sensor de temperatura DHT11",12000,"sensor"],["Sensor de movimiento PIR",9000,"sensor"],["Módulo relé de 2 canales",16000,"chip"],["Módulo Bluetooth HC-05",28000,"chip"],["Transistores surtidos",18000,"chip"],["Diodos 1N4007 (50 unidades)",8000,"chip"],["Multímetro digital",55000,"sensor"],["Cautín de 40 W",38000,"resistencia"],["Soldadura en rollo",16000,"cable"],["Fuente regulable 3 a 12 V",32000,"chip"],["Kit de potenciómetros",20000,"resistencia"],["Buzzer activo (10 unidades)",7000,"sensor"],["Pantalla LCD 16x2",24000,"monitor"],["Motor DC con caja reductora",19000,"sensor"],["Servomotor SG90",17000,"sensor"],["Pantalla OLED 0,96 pulgadas",26000,"monitor"],["Módulo WiFi ESP8266",35000,"chip"]],
  "Circuitos básicos": [["Paquete de 50 LEDs de colores",12000,"led"],["LEDs RGB (10 unidades)",9000,"led"],["Protoboard de 830 puntos",24000,"placa"],["Protoboard de 400 puntos",14000,"placa"],["Mini protoboard de 170 puntos",7000,"placa"],["Cables jumper (120 unidades)",18000,"cable"],["Jumper macho-hembra (40 unidades)",11000,"cable"],["Arduino Uno compatible",65000,"chip"],["Arduino Nano",38000,"chip"],["Arduino Mega",98000,"chip"],["Placa ESP32",52000,"chip"],["Raspberry Pi Pico",29000,"chip"],["Kit de iniciación en electrónica",120000,"placa"],["Kit de 37 sensores",135000,"sensor"],["Tira LED de 5 metros",42000,"led"],["Batería de 9 V con conector",10000,"cable"],["Portapilas 4 AA",6000,"cable"],["Placa perforada para soldar",12000,"placa"],["Kit de robot seguidor de línea",185000,"chip"],["Kit Arduino avanzado",249000,"placa"]]
};

const VENDEDORES = ["ElectroBogotá", "CircuitosMed", "TecnoCali", "GamerZone", "SoftPlus", "ChipCenter"];
const PRODUCTOS = [];
CATEGORIAS.forEach(cat => CATALOGO[cat].forEach((p, i) => {
  const id = PRODUCTOS.length + 1;
  PRODUCTOS.push({ id, nombre: p[0], cat, precio: p[1], icono: p[2], vendedor: VENDEDORES[(id * 5 + i) % 6], estrellas: +(4.2 + ((id * 7) % 9) / 10).toFixed(1) });
}));

const ARTICULOS = [
  { titulo: "Cómo empezar con tu primera protoboard", texto: "Una protoboard te permite armar circuitos sin soldar. Empieza con un LED, una resistencia de 220 ohmios y una fuente de 5 voltios: es la práctica ideal para entender la corriente." },
  { titulo: "¿Cuánta memoria RAM necesitas realmente?", texto: "Para estudiar y navegar basta con 8 GB, pero si programas, editas video o juegas, 16 GB es el punto ideal entre precio y rendimiento." },
  { titulo: "Por qué conviene pagar con intermediario", texto: "En Corex el dinero queda retenido hasta que recibes tu producto. Así el vendedor cumple y tú compras sin miedo a estafas." }
];
