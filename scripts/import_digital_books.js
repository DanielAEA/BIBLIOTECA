// Script para enriquecer el catálogo de CiberBook con libros digitales completos
const librosDigitales = [
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
    genero: "Gótico / Ficción",
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
    genero: "Ciencia Ficción / Terror",
    editorial: "Lackington, Hughes, Harding, Mavor & Jones",
    publicacion: "1818",
    isbn: "9788467034011",
    descripcion: "Víctor Frankenstein descubre el secreto de la vida y crea un ser dotado de inteligencia que desafía los límites de la ciencia humana.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/5230/pg5230-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/12818862-L.jpg"
  },
  {
    titulo: "Drácula",
    autor: "Bram Stoker",
    genero: "Terror Gótico",
    editorial: "Archibald Constable and Company",
    publicacion: "1897",
    isbn: "9788497940801",
    descripcion: "El conde Drácula viaja desde Transilvania a Inglaterra para extender su maldición nocturna en la novela de vampiros más famosa de todos los tiempos.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/34830/pg34830-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282420-L.jpg"
  },
  {
    titulo: "El Arte de la Guerra",
    autor: "Sun Tzu",
    genero: "Estrategia / Filosofía",
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
    genero: "Épica Griega",
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
    genero: "Épica Griega",
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
    genero: "Poesía Épica",
    editorial: "Cátedra",
    publicacion: "1320",
    isbn: "9788437604145",
    descripcion: "Dante desciende a través de los nueve círculos del Infierno, escala el Purgatorio y alcanza el Paraíso guiado por Virgilio y Beatriz.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/19597/pg19597-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282190-L.jpg"
  },
  {
    titulo: "Rimas y Leyendas",
    autor: "Gustavo Adolfo Bécquer",
    genero: "Romanticismo / Poesía",
    editorial: "Espasa-Calpe",
    publicacion: "1871",
    isbn: "9788423918508",
    descripcion: "Poemas líricos y relatos fantásticos llenos de misterio, desamor, leyendas toledanas y belleza melancólica.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/32474/pg32474-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282430-L.jpg"
  },
  {
    titulo: "La vida del Lazarillo de Tormes",
    autor: "Anónimo",
    genero: "Novela Picaresca",
    editorial: "Castalia",
    publicacion: "1554",
    isbn: "9788470390173",
    descripcion: "La aguda y divertida autobiografía de Lázaro, quien sirve a diversos amos para sobrevivir con ingenio en la España renacentista.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/32049/pg32049-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282440-L.jpg"
  },
  {
    titulo: "Niebla",
    autor: "Miguel de Unamuno",
    genero: "Nívola / Filosofía",
    editorial: "Cátedra",
    publicacion: "1914",
    isbn: "9788437603704",
    descripcion: "Augusto Pérez descubre que es un ente de ficción y viaja a Salamanca para confrontar a su propio autor sobre su destino.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/43828/pg43828-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282450-L.jpg"
  },
  {
    titulo: "Veinte mil leguas de viaje submarino",
    autor: "Julio Verne",
    genero: "Ciencia Ficción / Aventura",
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
    genero: "Ciencia Ficción / Aventura",
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
    titulo: "Cuentos de amor de locura y de muerte",
    autor: "Horacio Quiroga",
    genero: "Cuentos / Realismo Mágico",
    editorial: "Sociedad Cooperativa Editorial",
    publicacion: "1917",
    isbn: "9788437604626",
    descripcion: "Una inolvidable colección de relatos intensos ambientados en la selva misionera donde la naturaleza implacable y la psicología humana colisionan.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/43794/pg43794-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282490-L.jpg"
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
    genero: "Filosofía Política",
    editorial: "Antonio Blado d'Asola",
    publicacion: "1532",
    isbn: "9788420651279",
    descripcion: "El clásico tratado sobre el poder político, la diplomacia y el liderazgo que dio origen al pensamiento político moderno.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/1232/pg1232-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282520-L.jpg"
  },
  {
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    genero: "Novela Romántica / Costumbrista",
    editorial: "T. Egerton",
    publicacion: "1813",
    isbn: "9788497940733",
    descripcion: "La agudeza e independencia de Elizabeth Bennet chocan con el orgullo aristocrático del señor Darcy en una de las novelas más queridas de la literatura.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/1342/pg1342-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282530-L.jpg"
  },
  {
    titulo: "El fantasma de Canterville",
    autor: "Oscar Wilde",
    genero: "Fantasía / Sátira",
    editorial: "The Court and Society Review",
    publicacion: "1887",
    isbn: "9788497941556",
    descripcion: "Un espectro aristócrata británico intenta asustar sin éxito a una moderna familia estadounidense en una divertida sátira llena de ternura.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/14522/pg14522-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282540-L.jpg"
  },
  {
    titulo: "La isla del tesoro",
    autor: "Robert Louis Stevenson",
    genero: "Aventura / Piratas",
    editorial: "Cassell & Co.",
    publicacion: "1883",
    isbn: "9788467034028",
    descripcion: "El joven Jim Hawkins halla el mapa del tesoro del legendario Capitán Flint y zarpa en la Hispaniola junto al temible Long John Silver.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/120/pg120-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282550-L.jpg"
  },
  {
    titulo: "El extraño caso del doctor Jekyll y el señor Hyde",
    autor: "Robert Louis Stevenson",
    genero: "Terror / Psicológico",
    editorial: "Longmans, Green & Co.",
    publicacion: "1886",
    isbn: "9788467034035",
    descripcion: "El doctor Jekyll formula una pócima que separa el bien y el mal en la personalidad humana, liberando al siniestro mister Hyde.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/43/pg43-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282560-L.jpg"
  },
  {
    titulo: "Romancero Gitano",
    autor: "Federico García Lorca",
    genero: "Poesía Lírica",
    editorial: "Revista de Occidente",
    publicacion: "1928",
    isbn: "9788437601144",
    descripcion: "La cumbre poética de García Lorca donde la cultura andaluza, la pasión, el mito y la luna se funden en versos inmortales.",
    archivoDigital: "https://www.gutenberg.org/cache/epub/66380/pg66380-images.html",
    urlPortada: "https://covers.openlibrary.org/b/id/8282570-L.jpg"
  }
];

function getOrCreate(collection, name, entityClass) {
  let doc = db[collection].findOne({ nombre: name });
  if (!doc) {
    const id = new ObjectId().toString();
    db[collection].insertOne({
      _id: id,
      nombre: name,
      _class: entityClass
    });
    return id;
  }
  return doc._id;
}

let addedCount = 0;
let updatedCount = 0;

// Calcular el siguiente código LIB
let maxCode = 0;
db.libros.find().forEach(l => {
  if (l.codigo && l.codigo.startsWith("LIB")) {
    const n = parseInt(l.codigo.substring(3), 10);
    if (!isNaN(n) && n > maxCode) maxCode = n;
  }
});

librosDigitales.forEach(item => {
  const autorId = getOrCreate('autores', item.autor, 'com.biblioteca.entity.Autor');
  const generoId = getOrCreate('generos', item.genero, 'com.biblioteca.entity.Genero');
  const editorialId = getOrCreate('editoriales', item.editorial, 'com.biblioteca.entity.Editorial');

  let libroExistente = db.libros.findOne({ titulo: item.titulo });

  if (libroExistente) {
    // Actualizar libro existente para hacerlo digital completo
    db.libros.updateOne(
      { _id: libroExistente._id },
      {
        $set: {
          archivoDigital: item.archivoDigital,
          tieneDigital: true,
          formato: "AMBOS",
          descripcion: item.descripcion,
          publicacion: item.publicacion,
          urlPortada: item.urlPortada || libroExistente.urlPortada,
          isbn: item.isbn || libroExistente.isbn
        }
      }
    );
    updatedCount++;
    print(`[ACTUALIZADO DIGITAL] ${item.titulo}`);
  } else {
    maxCode++;
    const codigoStr = "LIB" + String(maxCode).padStart(4, "0");
    const nuevoId = new ObjectId().toString();
    
    // Crear ejemplar físico para que aparezca en inventario y préstamos además de lectura digital
    const ejemplarId = new ObjectId().toString();
    const ejemplar = {
      id: ejemplarId,
      codigo: `${codigoStr}-01`,
      disponible: true,
      estado: "DISPONIBLE",
      bloque: "DIGITAL",
      estante: "1"
    };

    db.libros.insertOne({
      _id: nuevoId,
      titulo: item.titulo,
      autores: [autorId],
      editorial: editorialId,
      genero: generoId,
      isbn: item.isbn,
      codigo: codigoStr,
      urlPortada: item.urlPortada,
      publicacion: item.publicacion,
      descripcion: item.descripcion,
      archivoDigital: item.archivoDigital,
      tieneDigital: true,
      formato: "AMBOS",
      ejemplares: [ejemplar],
      _class: "com.biblioteca.entity.Libro"
    });
    addedCount++;
    print(`[INSERTADO DIGITAL] ${item.titulo} (${codigoStr})`);
  }
});

print(`\n===== RESULTADO =====`);
print(`Libros nuevos insertados: ${addedCount}`);
print(`Libros existentes actualizados: ${updatedCount}`);
print(`Total libros en base de datos: ${db.libros.countDocuments()}`);