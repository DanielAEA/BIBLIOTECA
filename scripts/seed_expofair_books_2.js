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
const autorBilal = getOrCreate('autores', { nombre: /Bilal Philips/i }, { nombre: 'Dr. Bilal Philips' });
const autorRichman = getOrCreate('autores', { nombre: /Alyson Richman/i }, { nombre: 'Alyson Richman' });
const autorAraujo = getOrCreate('autores', { nombre: /Gracineia Ar/i }, { nombre: 'Gracineia Araújo' });
const autorTolle = getOrCreate('autores', { nombre: /Eckhart Tolle/i }, { nombre: 'Eckhart Tolle' });

// 2. GENEROS
const genReligion = getOrCreate('generos', { nombre: /Religi/i }, { nombre: 'Religión y Espiritualidad' });
const genNovelaHist = getOrCreate('generos', { nombre: /Hist/i }, { nombre: 'Novela Histórica' });
const genIdiomas = getOrCreate('generos', { nombre: /Idioma|Ling/i }, { nombre: 'Idiomas y Lingüística' });
const genEspiritual = getOrCreate('generos', { nombre: /Espiritualidad|Autoayuda/i }, { nombre: 'Espiritualidad y Superación' });

// 3. EDITORIALES
const edIiph = getOrCreate('editoriales', { nombre: /Islamic|IIPH/i }, { nombre: 'IIPH Publishing' });
const edPlaneta = getOrCreate('editoriales', { nombre: /Planeta/i }, { nombre: 'Editorial Planeta' });
const edCooperacion = getOrCreate('editoriales', { nombre: /Cooperaci/i }, { nombre: 'Cooperación Editorial' });
const edNewWorld = getOrCreate('editoriales', { nombre: /New World/i }, { nombre: 'New World Library' });

const nuevosLibros = [
  {
    codigo: 'LIB-EXPO-06',
    titulo: 'El Verdadero Mensaje de Jesucristo',
    autores: [autorBilal],
    editorial: edIiph,
    genero: genReligion,
    isbn: '978-9960-9148-3-1',
    publicacion: '1996',
    descripcion: 'Análisis teológico e histórico de los evangelios y textos bíblicos sobre la vida, misión y enseñanzas de Jesús de Nazaret. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/mensaje-jesucristo.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000006-0000-4000-a000-000000000006',
      id: 'e1000006-0000-4000-a000-000000000006',
      codigo: 'EXPO-006',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-07',
    titulo: 'El jardín italiano',
    autores: [autorRichman],
    editorial: edPlaneta,
    genero: genNovelaHist,
    isbn: '978-6070732898',
    publicacion: '2016',
    descripcion: 'Conmovedora novela ambientada en Portofino durante la Segunda Guerra Mundial: un relato apasionado sobre el arte, la valentía y el amor que desafió la opresión del régimen fascista. Ejemplar físico para la Expoferia.',
    urlPortada: 'assets/libros-expofair/jardin-italiano.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000007-0000-4000-a000-000000000007',
      id: 'e1000007-0000-4000-a000-000000000007',
      codigo: 'EXPO-007',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-08',
    titulo: 'Gramática Abreviada: Lengua Portuguesa',
    autores: [autorAraujo],
    editorial: edCooperacion,
    genero: genIdiomas,
    isbn: '978-9584483720',
    publicacion: '2010',
    descripcion: 'Manual didáctico y condensado de la serie LUX para el aprendizaje de las estructuras gramaticales, ortografía, conjugaciones y vocabulario del idioma portugués. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/gramatica-portuguesa.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000008-0000-4000-a000-000000000008',
      id: 'e1000008-0000-4000-a000-000000000008',
      codigo: 'EXPO-008',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  },
  {
    codigo: 'LIB-EXPO-09',
    titulo: 'The Power of Now: A Guide to Spiritual Enlightenment',
    autores: [autorTolle],
    editorial: edNewWorld,
    genero: genEspiritual,
    isbn: '978-1577314806',
    publicacion: '1997',
    descripcion: 'Fenómeno editorial número 1 del New York Times. Guía práctica y transformadora hacia la iluminación espiritual viviendo plenamente anclados en el momento presente. Ejemplar físico para interactuar en la Expoferia.',
    urlPortada: 'assets/libros-expofair/power-of-now.jpg',
    archivoDigital: null,
    tieneDigital: false,
    formato: 'FISICO',
    _class: 'com.biblioteca.entity.Libro',
    ejemplar: {
      _id: 'e1000009-0000-4000-a000-000000000009',
      id: 'e1000009-0000-4000-a000-000000000009',
      codigo: 'EXPO-009',
      disponible: true,
      estado: 'DISPONIBLE',
      bloque: 'Stand Expoferia',
      estante: 'Mesa 1'
    }
  }
];

nuevosLibros.forEach(b => {
  const ej = b.ejemplar;
  delete b.ejemplar;

  let libro = db.libros.findOne({
    $or: [
      { codigo: b.codigo },
      { 'ejemplares._id': ej._id },
      { 'ejemplares.id': ej.id },
      { 'ejemplares.codigo': ej.codigo },
      { titulo: b.titulo }
    ]
  });

  if (libro) {
    print(`[*] Actualizando: ${libro.titulo}`);
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
    print(`[+] Insertando nuevo: ${b.titulo}`);
    b.ejemplares = [ej];
    db.libros.insertOne(b);
  }
});

print("=== VERIFICACION COMPLETA DE TODOS LOS 9 EJEMPLARES DE EXPOFERIA ===");
db.libros.find({ "ejemplares.codigo": { $regex: /^EXPO-/ } }).forEach(l => {
  print("--------------------------------------------------");
  print("TITULO:   " + l.titulo);
  print("PORTADA:  " + l.urlPortada);
  l.ejemplares.filter(e => e.codigo.startsWith('EXPO')).forEach(e => {
    print(`  -> Codigo: ${e.codigo} | ID: ${e.id || e._id} | Bloque: ${e.bloque} | Estante: ${e.estante}`);
  });
});

