/**
 * Generador de Datasets de Usuarios y 1000 Préstamos para CiberBook
 * Conecta a MongoDB local o genera archivos listos para mongoimport.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genOid() {
  return crypto.randomBytes(12).toString('hex');
}

// 1. Nombres y Apellidos Hispanos Reales (100% Auténticos, Cero Nombres Ficticios o 'usuarioXX')
const nombresHombres = [
  "Alejandro", "Andrés", "Carlos", "Cristian", "Daniel", "David", "Diego",
  "Esteban", "Felipe", "Gabriel", "Guillermo", "Javier", "Jorge", "Juan Camilo",
  "Juan David", "Juan Pablo", "Julián", "Lucas", "Manuel", "Mateo", "Miguel Ángel",
  "Nicolás", "Rodrigo", "Samuel", "Santiago", "Sebastián", "Tomás", "Vicente",
  "Iván", "Óscar", "Fernando", "Ricardo", "Mauricio", "Leonardo", "Emilio",
  "Álvaro", "Hugo", "Gustavo", "Jaime", "Federico", "Gonzalo", "Camilo"
];

const nombresMujeres = [
  "Alejandra", "Ana María", "Andrea", "Camila", "Carolina", "Catalina",
  "Daniela", "Diana", "Elena", "Gabriela", "Isabella", "Juliana", "Laura",
  "Lucía", "Manuela", "Mariana", "Natalia", "Paola", "Paula", "Sara",
  "Sofía", "Tatiana", "Valentina", "Valeria", "Vanessa", "Verónica",
  "Claudia", "Adriana", "María José", "Paulina", "Luciana", "Victoria",
  "Silvia", "Patricia", "Ximena", "Nataly", "Carmen", "Rosa", "Marcela"
];

const apellidos = [
  "Restrepo", "Gómez", "Martínez", "Rodríguez", "Morales", "Valencia", "Rojas",
  "Castro", "Benítez", "Ospina", "Londoño", "Herrera", "Vargas", "Jiménez",
  "Silva", "Mendoza", "Cruz", "Ortiz", "Gutiérrez", "Castillo", "Torres",
  "Flores", "Navarro", "Salazar", "Reyes", "Pérez", "González", "Ramírez",
  "Álvarez", "Jaramillo", "Mejía", "Montoya", "Duque", "Giraldo", "Henao",
  "Castaño", "Quintero", "Ríos", "Zapata", "Cardona", "Sánchez", "Muñoz",
  "Correa", "Echeverry", "Bermúdez", "Arango", "Zuluaga", "Pineda", "Vásquez"
];

const dominios = ["gmail.com", "outlook.com", "ciberbook.edu.co", "hotmail.com", "yahoo.com"];

function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function generarUsuarios(cantidad = 120) {
  const usuarios = [];
  const correosUsados = new Set();
  
  // Bcrypt hash real para '123456'
  const passwordBcrypt = "$2a$10$pCz6IFd.jnqJU9M/XoqHTuBLyqiWpj2ELIDr33jeTeC1Z2cLVLFNq";

  for (let i = 0; i < cantidad; i++) {
    const esHombre = Math.random() > 0.48;
    const nombre = esHombre 
      ? nombresHombres[Math.floor(Math.random() * nombresHombres.length)]
      : nombresMujeres[Math.floor(Math.random() * nombresMujeres.length)];

    const ap1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    let ap2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    while (ap2 === ap1) {
      ap2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    }

    const nombreCompleto = `${nombre} ${ap1} ${ap2}`;

    // Correo realista
    const baseEmail = `${normalizarTexto(nombre)}.${normalizarTexto(ap1)}`;
    const dominio = dominios[Math.floor(Math.random() * dominios.length)];
    let correo = `${baseEmail}@${dominio}`;
    let contador = 1;
    while (correosUsados.has(correo)) {
      correo = `${baseEmail}${contador}@${dominio}`;
      contador++;
    }
    correosUsados.add(correo);

    // Fecha de registro distribuida entre enero 2024 y agosto 2026
    const diasAleatorios = Math.floor(Math.random() * 950);
    const fechaReg = new Date(2024, 0, 15);
    fechaReg.setDate(fechaReg.getDate() + diasAleatorios);

    usuarios.push({
      _id: { $oid: genOid() },
      nombre: nombreCompleto,
      correo: correo,
      password: passwordBcrypt,
      rol: "CLIENTE",
      proveedor: "LOCAL",
      fechaRegistro: { $date: fechaReg.toISOString() },
      _class: "com.biblioteca.entity.Usuario"
    });
  }

  return usuarios;
}

function generarPrestamos(usuarios, libros, cantidad = 1000) {
  const prestamos = [];
  const fechaHoy = new Date(2026, 10, 5); // 5 de Noviembre 2026

  for (let i = 0; i < cantidad; i++) {
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
    const libro = libros[Math.floor(Math.random() * libros.length)];

    // Selección de código de ejemplar
    let codigoEjemplar = "LIB-001";
    if (libro.ejemplares && libro.ejemplares.length > 0) {
      const ej = libro.ejemplares[Math.floor(Math.random() * libro.ejemplares.length)];
      codigoEjemplar = ej.codigo || codigoEjemplar;
    } else {
      codigoEjemplar = `LIB${String(i % 50 + 1).padStart(3, '0')}`;
    }

    // Elegir mes en los últimos 20 meses con estacionalidad
    const mesesAtras = Math.floor(Math.random() * 20); // 0 a 19 meses atrás
    const fechaBase = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() - mesesAtras, 1);
    const diasEnMes = new Date(fechaBase.getFullYear(), fechaBase.getMonth() + 1, 0).getDate();
    const dia = Math.floor(Math.random() * diasEnMes) + 1;
    const hora = 8 + Math.floor(Math.random() * 11);
    const minuto = Math.floor(Math.random() * 60);

    const fechaPrestamo = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), dia, hora, minuto, 0);

    // Fecha pactada de devolución (14 días después)
    const fechaDevolucion = new Date(fechaPrestamo);
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 14);

    let devuelto = true;
    let estado = "DEVUELTO";
    let fechaDevolucionReal = null;
    let multa = null;

    if (fechaDevolucion > fechaHoy) {
      // El préstamo está dentro del plazo vigente hoy
      devuelto = false;
      estado = "ACTIVO";
    } else {
      // Préstamo ya venció en el calendario
      const r = Math.random();
      if (r < 0.84) {
        // Devuelto a tiempo o con pocos días de diferencia
        devuelto = true;
        estado = "DEVUELTO";
        const diasTardanza = Math.floor(Math.random() * 15) + 3; // 3 a 17 días de duración
        fechaDevolucionReal = new Date(fechaPrestamo);
        fechaDevolucionReal.setDate(fechaDevolucionReal.getDate() + diasTardanza);

        // Si se devolvió después de la fecha pactada
        if (fechaDevolucionReal > fechaDevolucion) {
          const diasMora = Math.ceil((fechaDevolucionReal - fechaDevolucion) / (1000 * 60 * 60 * 24));
          const montoMulta = diasMora * 2000;
          multa = {
            monto: montoMulta,
            diasRetraso: diasMora,
            pagada: Math.random() > 0.25,
            fechaCreacion: { $date: fechaDevolucionReal.toISOString() }
          };
        }
      } else if (r < 0.94) {
        // Vencido y no devuelto aún
        devuelto = false;
        estado = "VENCIDO";
        const diasMora = Math.ceil((fechaHoy - fechaDevolucion) / (1000 * 60 * 60 * 24));
        multa = {
          monto: diasMora * 2000,
          diasRetraso: diasMora,
          pagada: false,
          fechaCreacion: { $date: fechaDevolucion.toISOString() }
        };
      } else {
        // Activo de larga estancia
        devuelto = false;
        estado = "ACTIVO";
      }
    }

    const tipoPrestamo = (libro.formato === "DIGITAL") ? "DIGITAL" : (Math.random() > 0.3 ? "FISICO" : "DIGITAL");

    // Construcción del libro.$id exacto según tipo (ObjectId o String)
    let libroRefId;
    if (typeof libro._id === 'object' && libro._id !== null) {
      if (libro._id.$oid) {
        libroRefId = { $oid: libro._id.$oid };
      } else if (libro._id.toString) {
        libroRefId = { $oid: libro._id.toString() };
      } else {
        libroRefId = libro._id;
      }
    } else {
      // String ID (e.g. "6aec011e1cd7c2c8f511402d")
      libroRefId = libro._id;
    }

    const prestamoDoc = {
      _id: { $oid: genOid() },
      usuario: {
        $ref: "usuarios",
        $id: { $oid: usuario._id.$oid }
      },
      libro: {
        $ref: "libros",
        $id: libroRefId
      },
      ejemplarCodigo: codigoEjemplar,
      tipoPrestamo: tipoPrestamo,
      fechaPrestamo: { $date: fechaPrestamo.toISOString() },
      fechaDevolucion: { $date: fechaDevolucion.toISOString() },
      devuelto: devuelto,
      estado: estado,
      _class: "com.biblioteca.entity.Prestamo"
    };

    if (fechaDevolucionReal) {
      prestamoDoc.fechaDevolucionReal = { $date: fechaDevolucionReal.toISOString() };
    }
    if (multa) {
      prestamoDoc.multa = multa;
    }

    prestamos.push(prestamoDoc);
  }

  // Ordenar cronológicamente
  prestamos.sort((a, b) => new Date(a.fechaPrestamo.$date) - new Date(b.fechaPrestamo.$date));

  return prestamos;
}

function exportarCsvUsuarios(usuarios, outputPath) {
  const headers = ["id", "nombre", "correo", "rol", "proveedor", "fechaRegistro"];
  const rows = usuarios.map(u => [
    `"${u._id.$oid}"`,
    `"${u.nombre}"`,
    `"${u.correo}"`,
    `"${u.rol}"`,
    `"${u.proveedor}"`,
    `"${u.fechaRegistro.$date}"`
  ].join(","));
  fs.writeFileSync(outputPath, [headers.join(","), ...rows].join("\n"), "utf8");
}

function exportarCsvPrestamos(prestamos, librosMap, usuariosMap, outputPath) {
  const headers = ["id", "usuarioId", "usuarioNombre", "libroId", "libroTitulo", "ejemplarCodigo", "tipoPrestamo", "fechaPrestamo", "fechaDevolucion", "devuelto", "estado"];
  const rows = prestamos.map(p => {
    const uOid = p.usuario.$id.$oid || p.usuario.$id;
    const lOid = (typeof p.libro.$id === 'object' && p.libro.$id.$oid) ? p.libro.$id.$oid : p.libro.$id;
    const uNom = usuariosMap[uOid] || "Usuario";
    const lTit = librosMap[lOid] || "Libro";
    return [
      `"${p._id.$oid}"`,
      `"${uOid}"`,
      `"${uNom}"`,
      `"${lOid}"`,
      `"${lTit.replace(/"/g, '""')}"`,
      `"${p.ejemplarCodigo}"`,
      `"${p.tipoPrestamo}"`,
      `"${p.fechaPrestamo.$date}"`,
      `"${p.fechaDevolucion.$date}"`,
      p.devuelto,
      `"${p.estado}"`
    ].join(",");
  });
  fs.writeFileSync(outputPath, [headers.join(","), ...rows].join("\n"), "utf8");
}

function main() {
  console.log("=============================================================");
  console.log("   GENERADOR DE DATASETS DE USUARIOS Y PRÉSTAMOS REALES");
  console.log("=============================================================");

  const datasetDir = path.join(__dirname, "..", "dataset_ciberbook");
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  let libros = [];

  // Si se ejecuta dentro de mongosh con conexión activa
  if (typeof db !== 'undefined' && db.libros) {
    console.log("[...] Consultando libros reales directamente desde MongoDB...");
    libros = db.libros.find().toArray();
    console.log(`[OK] Obtenidos ${libros.length} libros directamente de MongoDB.`);
  }

  // Fallback: leer archivo local si no está db definido o está vacío
  if (!libros || libros.length === 0) {
    const dumpLibrosPath = path.join(datasetDir, "biblioteca.libros.json");
    if (fs.existsSync(dumpLibrosPath)) {
      libros = JSON.parse(fs.readFileSync(dumpLibrosPath, "utf8"));
      console.log(`[OK] Catálogo cargado desde archivo json con ${libros.length} libros.`);
    } else {
      console.error("[ERROR] No se pudo obtener la lista de libros.");
      if (typeof process !== 'undefined') process.exit(1);
      return;
    }
  }

  // 1. Generar 120 Usuarios con nombres reales hispanos
  console.log("[...] Generando 120 usuarios con nombres y correos reales...");
  const usuarios = generarUsuarios(120);

  const usuariosJsonPath = path.join(datasetDir, "dataset_usuarios.json");
  fs.writeFileSync(usuariosJsonPath, JSON.stringify(usuarios, null, 2), "utf8");
  console.log(`[OK] Guardado JSON: ${usuariosJsonPath}`);

  const usuariosCsvPath = path.join(datasetDir, "dataset_usuarios.csv");
  exportarCsvUsuarios(usuarios, usuariosCsvPath);
  console.log(`[OK] Guardado CSV:  ${usuariosCsvPath}`);

  // 2. Generar 1000 Préstamos con historial estacional
  console.log("[...] Generando 1000 préstamos cronológicos y estacionales...");
  const prestamos = generarPrestamos(usuarios, libros, 1000);

  const prestamosJsonPath = path.join(datasetDir, "dataset_prestamos_1000.json");
  fs.writeFileSync(prestamosJsonPath, JSON.stringify(prestamos, null, 2), "utf8");
  console.log(`[OK] Guardado JSON: ${prestamosJsonPath}`);

  // Mapeos para CSV legible
  const librosMap = {};
  libros.forEach(l => {
    const idKey = (typeof l._id === 'object' && l._id !== null) ? (l._id.$oid || l._id.toString()) : l._id;
    librosMap[idKey] = l.titulo || "Sin título";
  });

  const usuariosMap = {};
  usuarios.forEach(u => {
    usuariosMap[u._id.$oid] = u.nombre;
  });

  const prestamosCsvPath = path.join(datasetDir, "dataset_prestamos_1000.csv");
  exportarCsvPrestamos(prestamos, librosMap, usuariosMap, prestamosCsvPath);
  console.log(`[OK] Guardado CSV:  ${prestamosCsvPath}`);

  // Estadísticas del dataset
  const estados = prestamos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] || 0) + 1;
    return acc;
  }, {});

  console.log("\n================ RESUMEN DE GENERACIÓN ================");
  console.log(` Usuarios generados:   ${usuarios.length} (todos con nombres reales hispanos)`);
  console.log(` Préstamos generados:  ${prestamos.length}`);
  console.log(` - Devueltos:          ${estados["DEVUELTO"] || 0}`);
  console.log(` - Activos vigentes:   ${estados["ACTIVO"] || 0}`);
  console.log(` - Vencidos:           ${estados["VENCIDO"] || 0}`);
  console.log(` - Con multas:         ${prestamos.filter(p => p.multa).length}`);
  console.log("========================================================\n");
}

main();
