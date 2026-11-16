// Helper to find or create document
function getOrCreate(collection, filter, doc) {
  let item = db[collection].findOne(filter);
  if (!item) {
    const res = db[collection].insertOne(doc);
    item = db[collection].findOne({ _id: res.insertedId });
    print(`[+] Creado en ${collection}: ${doc.nombre || doc.titulo}`);
  } else {
    print(`[=] Encontrado en ${collection}: ${item.nombre || item.titulo}`);
  }
  return item._id;
}

// 1. AUTORES
const autorWatchTower = getOrCreate('autores', { nombre: /Watch Tower/i }, { nombre: 'Watch Tower Bible and Tract Society' });
const autorValera = getOrCreate('autores', { nombre: /Juan Valera/i }, { nombre: 'Juan Valera' });
const autorShakespeare = getOrCreate('autores', { nombre: /William Shakespeare/i }, { nombre: 'William Shakespeare' });
const autorSackeyBrown = getOrCreate('autores', { nombre: /Edmund Sackey/i }, { nombre: 'Edmund Sackey-Brown' });
const autorStevenson = getOrCreate('autores', { nombre: /Robert Louis Stevenson/i }, { nombre: 'Robert Louis Stevenson' });

// 2. GENEROS
const genJuvenil = getOrCreate('generos', { nombre: /Desarrollo Personal|Juvenil/i }, { nombre: 'Desarrollo Personal y Juvenil' });
const genNovela = getOrCreate('generos', { nombre: /Novela Cl|Literatura Cl/i }, { nombre: 'Novela Clásica' });
const genTeatro = getOrCreate('generos', { nombre: /Teatro|Tragedia/i }, { nombre: 'Teatro y Tragedia' });
const genLiderazgo = getOrCreate('generos', { nombre: /Liderazgo/i }, { nombre: 'Liderazgo y Gestión' });
const genMisterio = getOrCreate('generos', { nombre: /Misterio|Terror/i }, { nombre: 'Misterio y Terror' });

// 3. EDITORIALES
const edWatchTower = getOrCreate('editoriales', { nombre: /Watchtower/i }, { nombre: 'Watch Tower' });
const edLosada = getOrCreate('editoriales', { nombre: /Losada/i }, { nombre: 'Editorial Losada' });
const edPanamericana = getOrCreate('editoriales', { nombre: /Panamericana/i }, { nombre: 'Editorial Panamericana' });
const edPinnacle = getOrCreate('editoriales', { nombre: /Pinnacle/i }, { nombre: 'Pinnacle Books' });

// 4. LIBROS Y EJEMPLARES
const expofairBooks = [
  {
    codigo: 'LIB-EXPO-01',
    titulo: 'Lo que los jóvenes preguntan: Respuestas prácticas (Volumen 1)',
    autores: [autorWatchTower],
    editorial: edWatchTower,
    genero: genJuvenil,
    isbn: '978-9974-90-001-1',
    publicacion: '2011',
    descripcion: 'Guía práctica que orienta a jóvenes sobre toma de decisiones, relaciones, familia y valores para el futuro. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/jovenes-preguntan.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000001-0000-4000-a000-000000000001',
      id: 'e1000001-0000-4000-a000-000000000001',
      codigo: 'EXPO-001',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-02',
    titulo: 'Pepita Jiménez',
    autores: [autorValera],
    editorial: edLosada,
    genero: genNovela,
    isbn: '978-8420658490',
    publicacion: '1874',
    descripcion: 'Aclamada novela psicológica en formato epistolar sobre el debate interior entre la devoción mística y la pasión humana. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/pepita-jimenez.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000002-0000-4000-a000-000000000002',
      id: 'e1000002-0000-4000-a000-000000000002',
      codigo: 'EXPO-002',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-03',
    titulo: 'Hamlet, El Príncipe de Dinamarca',
    autores: [autorShakespeare],
    editorial: edLosada,
    genero: genTeatro,
    isbn: '978-9873874109',
    publicacion: '1603',
    descripcion: 'Magna obra de William Shakespeare que profundiza en la melancolía, el engaño, la traición y la justicia en la corte de Elsinor. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/hamlet.jpg',
    archivoDigital: 'https://archive.org/embed/hamlet0000will_a9x5',
    tieneDigital: true,
    formato: 'AMBOS',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000003-0000-4000-a000-000000000003',
      id: 'e1000003-0000-4000-a000-000000000003',
      codigo: 'EXPO-003',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-04',
    titulo: 'Liderazgo 101: Compresión del Liderazgo',
    autores: [autorSackeyBrown],
    editorial: edPinnacle,
    genero: genLiderazgo,
    isbn: '978-9988-8501-1-0',
    publicacion: '2015',
    descripcion: 'Compendio esencial sobre el carácter, la visión y la influencia que forjan a un auténtico líder en el mundo contemporáneo. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/liderazgo-101.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000004-0000-4000-a000-000000000004',
      id: 'e1000004-0000-4000-a000-000000000004',
      codigo: 'EXPO-004',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-05',
    titulo: 'El extraño caso del Dr. Jekyll y Mr. Hyde',
    autores: [autorStevenson],
    editorial: edPanamericana,
    genero: genMisterio,
    isbn: '978-9583000546',
    publicacion: '1886',
    descripcion: 'Inmortal relato de Robert Louis Stevenson traducido por Pedro Laín sobre la lucha interior del hombre entre la bondad y sus impulsos más oscuros. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/dr-jekyll-mr-hyde.jpg',
    archivoDigital: 'https://www.gutenberg.org/cache/epub/43/pg43-images.html',
    tieneDigital: true,
    formato: 'AMBOS',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000005-0000-4000-a000-000000000005',
      id: 'e1000005-0000-4000-a000-000000000005',
      codigo: 'EXPO-005',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  }
];

expofairBooks.forEach(b => {
  const ej = b.ejemplar;
  delete b.ejemplar;

  // Buscar si ya existe por codigo o titulo
  let libro = db.libros.findOne({
    $or: [
      { codigo: b.codigo },
      { 'ejemplares._id': ej._id },
      { 'ejemplares.id': ej.id },
      { 'ejemplares.codigo': ej.codigo },
      { titulo: b.titulo }
    ]
  });

  if (!libro) {
    // Si es Hamlet existente antiguo
    if (b.codigo === 'LIB-EXPO-03') {
      const oldHamlet = db.libros.findOne({ _id: ObjectId('517b89a4ace36e630289b7f2') });
      if (oldHamlet) libro = oldHamlet;
    }
    // Si es Jekyll existente antiguo
    if (b.codigo === 'LIB-EXPO-05') {
      const oldJekyll = db.libros.findOne({ _id: ObjectId('a4dc503972970c01264ab9cb') });
      if (oldJekyll) libro = oldJekyll;
    }
  }

  if (libro) {
    print(`[*] Actualizando libro existente: ${libro.titulo} (${libro._id})`);
    
    // Filtrar ejemplares existentes para evitar duplicar el de la expofair
    let ejemplares = (libro.ejemplares || []).filter(e => e.codigo !== ej.codigo && e._id !== ej._id && e.id !== ej.id);
    ejemplares.unshift(ej);

    db.libros.updateOne(
      { _id: libro._id },
      {
        $set: {
          titulo: b.titulo,
          autores: b.autores,
          editorial: b.editorial,
          genero: b.genero,
          urlPortada: b.urlPortada,
          descripcion: b.descripcion,
          formato: b.formato,
          ejemplares: ejemplares
        }
      }
    );
  } else {
    print(`[+] Insertando nuevo libro: ${b.titulo}`);
    b.ejemplares = [ej];
    db.libros.insertOne(b);
  }
});

print("=== VERIFICACION DE LIBROS Y EJEMPLARES DE EXPOFERIA ===");
db.libros.find({ "ejemplares.codigo": { $regex: /^EXPO-/ } }).forEach(l => {
  print("--------------------------------------------------");
  print("LIBRO ID: " + l._id);
  print("TITULO:   " + l.titulo);
  print("PORTADA:  " + l.urlPortada);
  print("EJEMPLARES:");
  l.ejemplares.filter(e => e.codigo.startsWith('EXPO')).forEach(e => {
    print(`  -> Codigo: ${e.codigo} | ID: ${e.id || e._id} | Bloque: ${e.bloque} | Estante: ${e.estante}`);
  });
});
