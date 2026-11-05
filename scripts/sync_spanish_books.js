const fs = require('fs');

async function run() {
  const baseUrl = "https://ciberbook-backend-production.up.railway.app";
  console.log("1. Autenticando en Railway como administrador...");

  const loginRes = await fetch(baseUrl + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "admin@bib.com", password: "admin123" })
  });

  if (!loginRes.ok) {
    console.error("Error al autenticar:", await loginRes.text());
    return;
  }

  const { token } = await loginRes.json();
  console.log("Autenticacion exitosa.\n");

  const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  };

  console.log("2. Cargando catalogos existentes...");
  const [librosRes, autoresRes, editorialesRes, generosRes] = await Promise.all([
    fetch(baseUrl + "/api/libros?page=0&size=1000", { headers }).then(r => r.json()),
    fetch(baseUrl + "/api/autores", { headers }).then(r => r.json()),
    fetch(baseUrl + "/api/editoriales", { headers }).then(r => r.json()),
    fetch(baseUrl + "/api/generos", { headers }).then(r => r.json())
  ]);

  const librosExistentes = new Set((librosRes.content || []).map(l => l.titulo.toLowerCase().trim()));
  const autoresMap = new Map();
  (autoresRes || []).forEach(a => {
    if (a.nombre && !autoresMap.has(a.nombre.toLowerCase().trim())) {
      autoresMap.set(a.nombre.toLowerCase().trim(), a);
    }
  });

  const editorialesMap = new Map();
  (editorialesRes || []).forEach(e => {
    if (e.nombre && !editorialesMap.has(e.nombre.toLowerCase().trim())) {
      editorialesMap.set(e.nombre.toLowerCase().trim(), e);
    }
  });

  const generosMap = new Map();
  (generosRes || []).forEach(g => {
    if (g.nombre && !generosMap.has(g.nombre.toLowerCase().trim())) {
      generosMap.set(g.nombre.toLowerCase().trim(), g);
    }
  });

  console.log("Catalogo actual: " + librosExistentes.size + " libros, " + autoresMap.size + " autores, " + editorialesMap.size + " editoriales, " + generosMap.size + " generos.\n");

  async function getOrCreateAuthor(nombre) {
    const key = nombre.toLowerCase().trim();
    if (autoresMap.has(key)) return autoresMap.get(key);
    try {
      const res = await fetch(baseUrl + "/api/autores", {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        const data = await res.json();
        autoresMap.set(key, data);
        return data;
      }
    } catch (e) {}
    return null;
  }

  async function getOrCreateEditorial(nombre) {
    const key = nombre.toLowerCase().trim();
    if (editorialesMap.has(key)) return editorialesMap.get(key);
    try {
      const res = await fetch(baseUrl + "/api/editoriales", {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        const data = await res.json();
        editorialesMap.set(key, data);
        return data;
      }
    } catch (e) {}
    return null;
  }

  async function getOrCreateGenero(nombre) {
    const key = nombre.toLowerCase().trim();
    if (generosMap.has(key)) return generosMap.get(key);
    try {
      const res = await fetch(baseUrl + "/api/generos", {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre })
      });
      if (res.ok) {
        const data = await res.json();
        generosMap.set(key, data);
        return data;
      }
    } catch (e) {}
    return null;
  }

  const raw = fs.readFileSync("scripts/spanish_books_data.json", "utf8");
  const spanishBooks = JSON.parse(raw);
  console.log("3. Sincronizando " + spanishBooks.length + " libros en espanol a Railway...\n");
  let agregados = 0;
  let existentes = 0;

  for (let i = 0; i < spanishBooks.length; i++) {
    const b = spanishBooks[i];
    const key = b.titulo.toLowerCase().trim();

    if (librosExistentes.has(key)) {
      console.log("- [EXISTE] " + b.titulo);
      existentes++;
      continue;
    }

    const autorObj = await getOrCreateAuthor(b.autor);
    const editorialObj = await getOrCreateEditorial(b.editorial);
    const generoObj = await getOrCreateGenero(b.genero);

    const ejemplarCode = "ESP" + String(i + 1).padStart(3, "0");

    const payload = {
      titulo: b.titulo,
      autores: autorObj ? [autorObj] : [],
      editorial: editorialObj || null,
      genero: generoObj || null,
      isbn: b.isbn,
      urlPortada: b.urlPortada,
      publicacion: b.publicacion,
      descripcion: b.descripcion,
      archivoDigital: b.archivoDigital,
      tieneDigital: true,
      formato: b.formato || "AMBOS",
      ejemplares: [
        {
          id: "ej-esp-" + Date.now() + "-" + i,
          codigo: ejemplarCode,
          disponible: true,
          estado: "DISPONIBLE",
          bloque: b.bloque || "Literatura Hispana",
          estante: b.estante || "A1"
        }
      ]
    };

    try {
      const createRes = await fetch(baseUrl + "/api/libros", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (createRes.ok) {
        agregados++;
        console.log("+ [AGREGADO] " + b.titulo + " - " + b.autor + " (" + b.genero + ")");
        librosExistentes.add(key);
      } else {
        const err = await createRes.text();
        console.warn("! [ERROR] " + b.titulo + ": " + err);
      }
    } catch (e) {
      console.error("! [FALLO] " + b.titulo + ": " + e.message);
    }

    await new Promise(r => setTimeout(r, 60));
  }

  console.log("\n========================================");
  console.log("Proceso completado exitosamente:");
  console.log("  - Nuevos libros en espanol agregados: " + agregados);
  console.log("  - Libros ya existentes: " + existentes);
  console.log("  - Total en catalogo: " + librosExistentes.size);
  console.log("========================================");
}

run();