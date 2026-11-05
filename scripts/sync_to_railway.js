// Script para sincronizar el catálogo local hacia el backend de Railway vía REST API
const fs = require('fs');

async function sync() {
  const baseUrl = "https://ciberbook-backend-production.up.railway.app";
  
  console.log("1. Autenticando en Railway...");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "admin@bib.com", password: "admin123" })
  });

  if (!loginRes.ok) {
    console.error("Error al iniciar sesión:", await loginRes.text());
    return;
  }

  const { token } = await loginRes.json();
  console.log("Autenticación exitosa como ADMIN.");

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  // Obtener libros actuales en Railway
  const librosRes = await fetch(`${baseUrl}/api/libros`);
  const librosExistentes = await librosRes.json();
  const titulosExistentes = new Set(librosExistentes.map(l => l.titulo.toLowerCase().trim()));

  console.log(`Libros existentes en Railway: ${librosExistentes.length}`);

  // Cargar libros del script
  const importScript = fs.readFileSync(__dirname + '/import_digital_books.js', 'utf8');
  const match = importScript.match(/const librosDigitales = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error("No se pudo extraer la lista de libros.");
    return;
  }

  const librosDigitales = eval(match[1]);
  console.log(`Libros digitales a procesar: ${librosDigitales.length}`);

  for (const item of librosDigitales) {
    if (titulosExistentes.has(item.titulo.toLowerCase().trim())) {
      console.log(`[EXISTE] ${item.titulo}`);
      continue;
    }

    try {
      // 1. Obtener o crear Autor
      let autorRes = await fetch(`${baseUrl}/api/autores`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre: item.autor })
      });
      let autorData = autorRes.ok ? await autorRes.json() : null;

      // 2. Obtener o crear Editorial
      let editRes = await fetch(`${baseUrl}/api/editoriales`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre: item.editorial })
      });
      let editData = editRes.ok ? await editRes.json() : null;

      // 3. Obtener o crear Genero
      let genRes = await fetch(`${baseUrl}/api/generos`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre: item.genero })
      });
      let genData = genRes.ok ? await genRes.json() : null;

      // 4. Crear Libro
      const libroPayload = {
        titulo: item.titulo,
        autores: autorData ? [autorData] : [],
        editorial: editData,
        genero: genData,
        isbn: item.isbn,
        urlPortada: item.urlPortada,
        publicacion: item.publicacion,
        descripcion: item.descripcion,
        archivoDigital: item.archivoDigital,
        tieneDigital: true,
        formato: "AMBOS"
      };

      let createRes = await fetch(`${baseUrl}/api/libros`, {
        method: "POST",
        headers,
        body: JSON.stringify(libroPayload)
      });

      if (createRes.ok) {
        console.log(`[SUBIDO A RAILWAY] ${item.titulo}`);
      } else {
        const err = await createRes.text();
        console.warn(`[ERROR AL SUBIR] ${item.titulo}: ${err}`);
      }
    } catch (e) {
      console.error(`Error procesando ${item.titulo}:`, e.message);
    }
  }

  console.log("\nProceso de sincronización finalizado.");
}

sync();