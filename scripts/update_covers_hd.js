const fs = require('fs');
const path = require('path');

const highDefCovers = {
  "don quijote de la mancha": "https://covers.openlibrary.org/b/id/13478610-L.jpg",
  "la metamorfosis": "https://covers.openlibrary.org/b/id/14073660-L.jpg",
  "el principito": "https://covers.openlibrary.org/b/id/13499066-L.jpg",
  "el retrato de dorian gray": "https://covers.openlibrary.org/b/id/8061086-L.jpg",
  "frankenstein o el moderno prometeo": "https://covers.openlibrary.org/b/id/12356249-L.jpg",
  "drácula": "https://covers.openlibrary.org/b/id/12216503-L.jpg",
  "dracula": "https://covers.openlibrary.org/b/id/12216503-L.jpg",
  "el arte de la guerra": "https://covers.openlibrary.org/b/id/13584132-L.jpg",
  "la odisea": "https://covers.openlibrary.org/b/id/13180792-L.jpg",
  "la ilíada": "https://covers.openlibrary.org/b/id/643208-L.jpg",
  "la iliada": "https://covers.openlibrary.org/b/id/643208-L.jpg",
  "la divina comedia": "https://covers.openlibrary.org/b/id/12821190-L.jpg",
  "rimas y leyendas": "https://covers.openlibrary.org/b/id/9266155-L.jpg",
  "la vida del lazarillo de tormes": "https://covers.openlibrary.org/b/id/10565893-L.jpg",
  "niebla": "https://covers.openlibrary.org/b/id/8040432-L.jpg",
  "veinte mil leguas de viaje submarino": "https://covers.openlibrary.org/b/id/13527935-L.jpg",
  "viaje al centro de la tierra": "https://covers.openlibrary.org/b/id/2129972-L.jpg",
  "la vuelta al mundo en ochenta días": "https://covers.openlibrary.org/b/id/8291461-L.jpg",
  "la vuelta al mundo en ochenta dias": "https://covers.openlibrary.org/b/id/8291461-L.jpg",
  "cuentos de amor de locura y de muerte": "https://covers.openlibrary.org/b/id/8314151-L.jpg",
  "el sabueso de los baskerville": "https://covers.openlibrary.org/b/id/10861290-L.jpg",
  "estudio en escarlata": "https://covers.openlibrary.org/b/id/13574672-L.jpg",
  "el príncipe": "https://covers.openlibrary.org/b/id/7280545-L.jpg",
  "el principe": "https://covers.openlibrary.org/b/id/7280545-L.jpg",
  "orgullo y prejuicio": "https://covers.openlibrary.org/b/id/13574150-L.jpg",
  "el fantasma de canterville": "https://covers.openlibrary.org/b/id/10520216-L.jpg",
  "la isla del tesoro": "https://covers.openlibrary.org/b/id/12331377-L.jpg",
  "el extraño caso del doctor jekyll y el señor hyde": "https://covers.openlibrary.org/b/id/10520216-L.jpg",
  "el extrano caso del doctor jekyll y el senor hyde": "https://covers.openlibrary.org/b/id/10520216-L.jpg",
  "romancero gitano": "https://covers.openlibrary.org/b/id/5985528-L.jpg",
  "cien años de soledad": "https://covers.openlibrary.org/b/id/12627383-L.jpg",
  "cien anos de soledad": "https://covers.openlibrary.org/b/id/12627383-L.jpg",
  "el hobbit": "https://covers.openlibrary.org/b/id/12521736-L.jpg",
  "las dos torres": "https://covers.openlibrary.org/b/id/8175145-L.jpg",
  "harry potter y la piedra filosofal": "https://covers.openlibrary.org/b/id/10522444-L.jpg",
  "viaje a la alcarria": "https://covers.openlibrary.org/b/id/8031101-L.jpg",
  "chronicle of a death foretold": "https://covers.openlibrary.org/b/id/10543666-L.jpg",
  "la gaviota": "https://covers.openlibrary.org/b/id/13478610-L.jpg",
  "nada, nadie": "https://covers.openlibrary.org/b/id/10565893-L.jpg"
};

async function updateAll() {
  console.log("=== Actualizando portadas con imágenes en Alta Definición ===");
  
  const filesToUpdate = [
    "C:\\Users\\danie\\Desktop\\proyecto biblioteca\\dataset_ciberbook\\biblioteca.libros.json",
    "C:\\Users\\danie\\Desktop\\mongo\\biblioteca.libros.json"
  ];

  for (const f of filesToUpdate) {
    if (!fs.existsSync(f)) continue;
    let libros = JSON.parse(fs.readFileSync(f, 'utf8'));
    let updated = 0;
    
    for (let l of libros) {
      const key = l.titulo.toLowerCase().trim();
      if (highDefCovers[key]) {
        l.urlPortada = highDefCovers[key];
        updated++;
      } else if (!l.urlPortada || l.urlPortada.includes("placeholder") || l.urlPortada.includes("google")) {
        l.urlPortada = "assets/default-cover.svg";
        updated++;
      }
    }
    
    fs.writeFileSync(f, JSON.stringify(libros, null, 2), 'utf8');
    console.log(`Actualizado ${f}: ${updated} portadas HD.`);
  }

  // Actualizar también CSV
  const csvPath = "C:\\Users\\danie\\Desktop\\proyecto biblioteca\\dataset_ciberbook\\dataset_libros_ciberbook.csv";
  if (fs.existsSync(csvPath)) {
    const jsonPath = "C:\\Users\\danie\\Desktop\\proyecto biblioteca\\dataset_ciberbook\\biblioteca.libros.json";
    const libros = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const flat = libros.map(l => ({
      codigo: l.codigo,
      titulo: l.titulo,
      url_portada: l.urlPortada,
      archivoDigital: l.archivoDigital,
      formato: l.formato
    }));

    const csvHeaders = "codigo,titulo,url_portada,archivoDigital,formato\n";
    const csvRows = flat.map(d => {
      const esc = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
      return [esc(d.codigo), esc(d.titulo), esc(d.url_portada), esc(d.archivoDigital), esc(d.formato)].join(",");
    }).join("\n");
    fs.writeFileSync(csvPath, csvHeaders + csvRows, 'utf8');
    console.log("CSV actualizado con portadas en alta definición.");
  }
}

updateAll();