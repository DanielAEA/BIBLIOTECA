const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genOid() {
  return crypto.randomBytes(12).toString('hex');
}

function cleanGenre(subjects) {
  if (!subjects || subjects.length === 0) return "Literatura Clásica";
  for (const s of subjects) {
    const lower = s.toLowerCase();
    if (lower.includes("sci") || lower.includes("cienc")) return "Ciencia Ficción";
    if (lower.includes("fantas")) return "Fantasía";
    if (lower.includes("terror") || lower.includes("horror") || lower.includes("gothic")) return "Terror / Gótico";
    if (lower.includes("romance") || lower.includes("amor")) return "Novela Romántica";
    if (lower.includes("mister") || lower.includes("detectiv") || lower.includes("crim")) return "Misterio / Policial";
    if (lower.includes("aventur") || lower.includes("adventure")) return "Aventura";
    if (lower.includes("filosof") || lower.includes("philosoph")) return "Filosofía";
    if (lower.includes("histori") || lower.includes("history")) return "Historia";
    if (lower.includes("poes") || lower.includes("poetry")) return "Poesía";
    if (lower.includes("teatro") || lower.includes("drama")) return "Teatro";
    if (lower.includes("cuento") || lower.includes("story")) return "Cuentos";
    if (lower.includes("novela") || lower.includes("fiction")) return "Novela";
  }
  return subjects[0].split(',')[0].replace(/[^\w\s\u00C0-\u017F]/gi, '').trim() || "Literatura General";
}

function cleanPublisher(publishers) {
  if (!publishers || publishers.length === 0) return "Editorial Universal";
  let p = publishers[0].split('/')[0].split(',')[0].trim();
  return p.length > 40 ? p.substring(0, 40) : p;
}

const clasicosCurados = [
  {
    titulo: "Don Quijote de la Mancha",
    autor: "Miguel de Cervantes Saavedra",
    genero: "Novela Clásica",
    editorial: "Real Academia Española",
    publicacion: "1605",
    isbn: "9788420412146",
    descripcion: "La cumbre de la literatura española. Narra las aventuras del ingenioso hidalgo Don Quijote y su fiel escudero Sancho Panza.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/2000/pg2000-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8314151-L.jpg"
  },
  {
    titulo: "La Metamorfosis",
    autor: "Franz Kafka",
    genero: "Ficción Absurda",
    editorial: "Alianza Editorial",
    publicacion: "1915",
    isbn: "9788420651361",
    descripcion: "Una mañana Gregor Samsa se despierta convertido en un monstruoso insecto. Obra maestra sobre la alienación y el absurdo de la existencia.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/57258/pg57258-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/12836243-L.jpg"
  },
  {
    titulo: "El Principito",
    autor: "Antoine de Saint-Exupéry",
    genero: "Fábula Filosófica",
    editorial: "Reynal & Hitchcock",
    publicacion: "1943",
    isbn: "9780156013925",
    descripcion: "Un piloto perdido en el desierto conoce a un pequeño príncipe de otro planeta. Reflexión profunda sobre el amor, la amistad y lo esencial invisible a los ojos.",
    archivoDigital: "https://archive.org/embed/elprincipito0000sain",
    urlPortada: "https://covers.openlibrary.org/b/isbn/9780156013925-L.jpg"
  },
  {
    titulo: "El retrato de Dorian Gray",
    autor: "Oscar Wilde",
    genero: "Terror / Gótico",
    editorial: "Lippincott's",
    publicacion: "1890",
    isbn: "9788497941549",
    descripcion: "Dorian Gray mantiene su eterna juventud mientras un retrato oculto refleja la decadencia física y moral de sus actos.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/44588/pg44588-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282361-L.jpg"
  },
  {
    titulo: "Frankenstein o el moderno Prometeo",
    autor: "Mary Shelley",
    genero: "Ciencia Ficción",
    editorial: "Lackington",
    publicacion: "1818",
    isbn: "9788467034011",
    descripcion: "Víctor Frankenstein descubre el secreto de la vida y crea un ser dotado de inteligencia que desafía los límites de la ciencia humana.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/5230/pg5230-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/12818862-L.jpg"
  },
  {
    titulo: "Drácula",
    autor: "Bram Stoker",
    genero: "Terror / Gótico",
    editorial: "Constable",
    publicacion: "1897",
    isbn: "9788497940801",
    descripcion: "El conde Drácula viaja desde Transilvania a Inglaterra para extender su maldición nocturna en la novela de vampiros más famosa de todos los tiempos.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/34830/pg34830-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282420-L.jpg"
  },
  {
    titulo: "El Arte de la Guerra",
    autor: "Sun Tzu",
    genero: "Filosofía",
    editorial: "Clásicos Universales",
    publicacion: "-500",
    isbn: "9788441408265",
    descripcion: "El tratado militar y filosófico más influyente de la historia, aplicable a la táctica, los negocios y la vida cotidiana.",
    archivoDigital: "https://archive.org/embed/elartedelaguerra0000sunt",
    urlPortada: "https://covers.openlibrary.org/b/id/8231856-L.jpg"
  },
  {
    titulo: "La Odisea",
    autor: "Homero",
    genero: "Aventura",
    editorial: "Gredos",
    publicacion: "-800",
    isbn: "9788424924461",
    descripcion: "El legendario viaje de regreso de Odiseo a Ítaca tras la Guerra de Troya enfrentando monstruos mitológicos, hechiceras y dioses.",
    archivoDigital: "https://archive.org/embed/laodisea0000home",
    urlPortada: "https://covers.openlibrary.org/b/id/8282110-L.jpg"
  },
  {
    titulo: "La Ilíada",
    autor: "Homero",
    genero: "Aventura",
    editorial: "Gredos",
    publicacion: "-750",
    isbn: "9788424924478",
    descripcion: "La furia de Aquiles y el asedio final a Troya en la epopeya fundacional de la cultura occidental.",
    archivoDigital: "https://archive.org/embed/lailiada0000home",
    urlPortada: "https://covers.openlibrary.org/b/id/8282112-L.jpg"
  },
  {
    titulo: "La Divina Comedia",
    autor: "Dante Alighieri",
    genero: "Poesía",
    editorial: "Cátedra",
    publicacion: "1320",
    isbn: "9788437604145",
    descripcion: "Dante desciende a través de los nueve círculos del Infierno, escala el Purgatorio y alcanza el Paraíso guiado por Virgilio y Beatriz.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/19597/pg19597-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282190-L.jpg"
  },
  {
    titulo: "Veinte mil leguas de viaje submarino",
    autor: "Julio Verne",
    genero: "Ciencia Ficción",
    editorial: "Hetzel",
    publicacion: "1870",
    isbn: "9788467035414",
    descripcion: "A bordo del submarino Nautilus con el enigmático Capitán Nemo, surcando las profundidades inexploradas de todos los océanos del planeta.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/20996/pg20996-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282460-L.jpg"
  },
  {
    titulo: "Viaje al centro de la Tierra",
    autor: "Julio Verne",
    genero: "Ciencia Ficción",
    editorial: "Hetzel",
    publicacion: "1864",
    isbn: "9788467035421",
    descripcion: "El profesor Lidenbrock, su sobrino Axel y el guía Hans descienden por el cráter de un volcán islandés hacia el interior de la Tierra.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/4791/pg4791-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282470-L.jpg"
  },
  {
    titulo: "La vuelta al mundo en ochenta días",
    autor: "Julio Verne",
    genero: "Aventura",
    editorial: "Hetzel",
    publicacion: "1872",
    isbn: "9788467035438",
    descripcion: "El metódico caballero inglés Phileas Fogg y su mayordomo Passepartout emprenden una emocionante carrera contrarreloj alrededor del globo.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/8387/pg8387-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282480-L.jpg"
  },
  {
    titulo: "El sabueso de los Baskerville",
    autor: "Arthur Conan Doyle",
    genero: "Misterio / Policial",
    editorial: "George Newnes",
    publicacion: "1902",
    isbn: "9788467033328",
    descripcion: "Sherlock Holmes y el Dr. Watson investigan la misteriosa muerte de Sir Charles Baskerville en los brumosos páramos de Devon.",
    archivoDigital: "https://archive.org/embed/elsabuesodelosba0000doyl",
    urlPortada: "https://covers.openlibrary.org/b/id/8282500-L.jpg"
  },
  {
    titulo: "Estudio en escarlata",
    autor: "Arthur Conan Doyle",
    genero: "Misterio / Policial",
    editorial: "Ward, Lock & Co",
    publicacion: "1887",
    isbn: "9788467033335",
    descripcion: "El histórico primer caso donde se conocen el detective asesor Sherlock Holmes y el doctor John H. Watson.",
    archivoDigital: "https://archive.org/embed/estudioenescarl0000doyl",
    urlPortada: "https://covers.openlibrary.org/b/id/8282510-L.jpg"
  },
  {
    titulo: "El Príncipe",
    autor: "Nicolás Maquiavelo",
    genero: "Filosofía",
    editorial: "Antonio Blado",
    publicacion: "1532",
    isbn: "9788420651279",
    descripcion: "El clásico tratado sobre el poder político, la diplomacia y el liderazgo que dio origen al pensamiento político moderno.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/1232/pg1232-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282520-L.jpg"
  },
  {
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    genero: "Novela Romántica",
    editorial: "T. Egerton",
    publicacion: "1813",
    isbn: "9788497940733",
    descripcion: "La agudeza e independencia de Elizabeth Bennet chocan con el orgullo aristocrático del señor Darcy.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/1342/pg1342-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282530-L.jpg"
  },
  {
    titulo: "La isla del tesoro",
    autor: "Robert Louis Stevenson",
    genero: "Aventura",
    editorial: "Cassell & Co.",
    publicacion: "1883",
    isbn: "9788467034028",
    descripcion: "El joven Jim Hawkins halla el mapa del tesoro del legendario Capitán Flint y zarpa en la Hispaniola.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/120/pg120-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282550-L.jpg"
  },
  {
    titulo: "El extraño caso del doctor Jekyll y el señor Hyde",
    autor: "Robert Louis Stevenson",
    genero: "Terror / Gótico",
    editorial: "Longmans",
    publicacion: "1886",
    isbn: "9788467034035",
    descripcion: "El doctor Jekyll formula una pócima que separa el bien y el mal en la personalidad humana, liberando al siniestro mister Hyde.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/43/pg43-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282560-L.jpg"
  },
  {
    titulo: "Romancero Gitano",
    autor: "Federico García Lorca",
    genero: "Poesía",
    editorial: "Revista de Occidente",
    publicacion: "1928",
    isbn: "9788437601144",
    descripcion: "La cumbre poética de García Lorca donde la cultura andaluza, la pasión, el mito y la luna se funden en versos inmortales.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/66380/pg66380-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282570-L.jpg"
  }
];

async function main() {
  console.log("=== Construyendo Dataset Masivo de Libros Digitales para CiberBook ===");
  const outDir = "C:\\Users\\danie\\Desktop\\proyecto biblioteca\\dataset_ciberbook";
  const mongoDir = "C:\\Users\\danie\\Desktop\\mongo";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const fields = "title,author_name,first_publish_year,cover_i,ia,publisher,subject,isbn";
  const queries = [
    `https://openlibrary.org/search.json?q=language:spa+AND+has_fulltext:true&fields=${fields}&limit=100`,
    `https://openlibrary.org/search.json?q=subject:novela+AND+language:spa+AND+has_fulltext:true&fields=${fields}&limit=60`,
    `https://openlibrary.org/search.json?q=subject:ficcion+AND+language:spa+AND+has_fulltext:true&fields=${fields}&limit=60`,
    `https://openlibrary.org/search.json?q=subject:clasicos+AND+language:spa+AND+has_fulltext:true&fields=${fields}&limit=60`,
    `https://openlibrary.org/search.json?q=subject:aventura+AND+language:spa+AND+has_fulltext:true&fields=${fields}&limit=60`,
    `https://openlibrary.org/search.json?q=subject:filosofia+AND+language:spa+AND+has_fulltext:true&fields=${fields}&limit=60`
  ];

  const booksMap = new Map();

  // 1. Agregar clásicos curados
  for (const c of clasicosCurados) {
    booksMap.set(c.titulo.toLowerCase().trim(), {
      title: c.titulo,
      author_name: [c.autor],
      subject: [c.genero],
      publisher: [c.editorial],
      first_publish_year: parseInt(c.publicacion, 10),
      isbn: [c.isbn],
      urlPortada: c.urlPortada,
      archivoDigital: c.archivoDigital,
      descripcion: c.descripcion
    });
  }

  // 2. Consultar APIs públicas
  for (const q of queries) {
    console.log(`Consultando API: ${q.substring(0, 75)}...`);
    try {
      const res = await fetch(q);
      const data = await res.json();
      if (data && data.docs) {
        for (const doc of data.docs) {
          if (!doc.title || !doc.author_name || !doc.cover_i || !doc.ia || doc.ia.length === 0) continue;
          const cleanTitle = doc.title.trim();
          const key = cleanTitle.toLowerCase();
          if (!booksMap.has(key)) {
            booksMap.set(key, doc);
          }
        }
      }
    } catch (e) {
      console.warn("Fallo en consulta:", e.message);
    }
  }

  console.log(`Total libros únicos procesados: ${booksMap.size}`);

  const autoresMap = new Map();
  const generosMap = new Map();
  const editorialesMap = new Map();

  function getOid(map, name, entityClass) {
    const trimmed = (name || "Desconocido").trim();
    if (!map.has(trimmed)) {
      map.set(trimmed, {
        _id: { $oid: genOid() },
        nombre: trimmed,
        _class: entityClass
      });
    }
    return map.get(trimmed)._id;
  }

  const librosList = [];
  const flatDataset = [];
  let codeNum = 1;

  for (const [key, doc] of booksMap) {
    const titulo = doc.title.trim();
    const autorNombre = (doc.author_name && doc.author_name[0]) ? doc.author_name[0].trim() : "Autor Clásico";
    const generoNombre = cleanGenre(doc.subject);
    const editorialNombre = cleanPublisher(doc.publisher);
    const coverUrl = doc.urlPortada || `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    const readerUrl = doc.archivoDigital || `https://archive.org/embed/${doc.ia[0]}`;
    const isbn = (doc.isbn && doc.isbn[0]) ? doc.isbn[0] : "";
    const publicacion = doc.first_publish_year ? String(doc.first_publish_year) : "1900";
    const codigo = "LIB" + String(codeNum++).padStart(4, "0");
    const desc = doc.descripcion || `Edición digital completa catalogada en CiberBook. Lectura abierta y texto íntegro disponible en línea.`;

    const autorOid = getOid(autoresMap, autorNombre, "com.biblioteca.entity.Autor");
    const generoOid = getOid(generosMap, generoNombre, "com.biblioteca.entity.Genero");
    const editorialOid = getOid(editorialesMap, editorialNombre, "com.biblioteca.entity.Editorial");

    const ejemplarId = crypto.randomUUID();
    const ejemplar = {
      id: ejemplarId,
      codigo: `${codigo}-01`,
      disponible: true,
      estado: "DISPONIBLE",
      bloque: "DIGITAL",
      estante: "1"
    };

    const libroDoc = {
      _id: { $oid: genOid() },
      titulo: titulo,
      autores: [autorOid],
      editorial: editorialOid,
      genero: generoOid,
      isbn: isbn,
      codigo: codigo,
      urlPortada: coverUrl,
      publicacion: publicacion,
      descripcion: desc,
      archivoDigital: readerUrl,
      tieneDigital: true,
      formato: "AMBOS",
      ejemplares: [ejemplar],
      _class: "com.biblioteca.entity.Libro"
    };

    librosList.push(libroDoc);

    flatDataset.push({
      codigo: codigo,
      titulo: titulo,
      autor: autorNombre,
      genero: generoNombre,
      editorial: editorialNombre,
      año: publicacion,
      isbn: isbn,
      url_portada: coverUrl,
      url_lector_digital: readerUrl,
      tiene_digital: true,
      formato: "AMBOS"
    });
  }

  // Guardar en outDir y en Desktop/mongo
  const dirs = [outDir, mongoDir];
  for (const d of dirs) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "biblioteca.libros.json"), JSON.stringify(librosList, null, 2), "utf8");
    fs.writeFileSync(path.join(d, "biblioteca.autores.json"), JSON.stringify(Array.from(autoresMap.values()), null, 2), "utf8");
    fs.writeFileSync(path.join(d, "biblioteca.generos.json"), JSON.stringify(Array.from(generosMap.values()), null, 2), "utf8");
    fs.writeFileSync(path.join(d, "biblioteca.editoriales.json"), JSON.stringify(Array.from(editorialesMap.values()), null, 2), "utf8");
  }

  // Guardar JSON plano
  fs.writeFileSync(path.join(outDir, "dataset_libros_completo.json"), JSON.stringify(flatDataset, null, 2), "utf8");

  // Guardar CSV
  const csvHeaders = "codigo,titulo,autor,genero,editorial,año,isbn,url_portada,url_lector_digital,tiene_digital,formato\n";
  const csvRows = flatDataset.map(d => {
    const esc = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
    return [
      esc(d.codigo),
      esc(d.titulo),
      esc(d.autor),
      esc(d.genero),
      esc(d.editorial),
      esc(d.año),
      esc(d.isbn),
      esc(d.url_portada),
      esc(d.url_lector_digital),
      d.tiene_digital,
      esc(d.formato)
    ].join(",");
  }).join("\n");

  fs.writeFileSync(path.join(outDir, "dataset_libros_ciberbook.csv"), csvHeaders + csvRows, "utf8");

  console.log("\n=========================================");
  console.log("   DATASET GENERADO CON ÉXITO");
  console.log("=========================================");
  console.log(`Total Libros Digitales:   ${librosList.length}`);
  console.log(`Total Autores:            ${autoresMap.size}`);
  console.log(`Total Géneros:            ${generosMap.size}`);
  console.log(`Total Editoriales:        ${editorialesMap.size}`);
  console.log(`Directorio Dataset:       ${outDir}`);
  console.log(`Directorio Mongo Desktop: ${mongoDir}`);
  console.log("=========================================");
}

main();