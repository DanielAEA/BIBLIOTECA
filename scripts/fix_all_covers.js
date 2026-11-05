const fs = require('fs');

async function fixAllCovers() {
  const baseUrl = "https://ciberbook-backend-production.up.railway.app";
  console.log("1. Autenticando...");
  const loginRes = await fetch(baseUrl + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo: "admin@bib.com", password: "admin123" })
  });

  const { token } = await loginRes.json();
  const headers = {
    "Authorization": "Bearer " + token,
    "Content-Type": "application/json"
  };

  console.log("2. Obteniendo todos los libros...");
  const res = await fetch(baseUrl + "/api/libros?page=0&size=1000", { headers });
  const data = await res.json();
  const books = data.content || [];
  console.log("Total libros en DB:", books.length);

  // Diccionario de portadas verificadas para clasicos importantes
  const manualVerifiedCovers = {
    "don quijote de la mancha": "https://covers.openlibrary.org/b/id/13478610-L.jpg",
    "cien años de soledad": "https://covers.openlibrary.org/b/id/12627383-L.jpg",
    "el amor en los tiempos del cólera": "https://covers.openlibrary.org/b/id/10096404-L.jpg",
    "crónica de una muerte anunciada": "https://covers.openlibrary.org/b/id/8489859-L.jpg",
    "el principito": "https://covers.openlibrary.org/b/id/13499066-L.jpg",
    "ficciones": "https://covers.openlibrary.org/b/id/10832290-L.jpg",
    "el aleph": "https://covers.openlibrary.org/b/id/10832290-L.jpg",
    "rayuela": "https://covers.openlibrary.org/b/id/1047466-L.jpg",
    "bestiario": "https://covers.openlibrary.org/b/id/728876-L.jpg",
    "pedro páramo": "https://covers.openlibrary.org/b/id/5419076-L.jpg",
    "el llano en llamas": "https://covers.openlibrary.org/b/id/8233318-L.jpg",
    "la ciudad y los perros": "https://covers.openlibrary.org/b/id/3221667-L.jpg",
    "conversación en la catedral": "https://covers.openlibrary.org/b/id/12532400-L.jpg",
    "la fiesta del chivo": "https://covers.openlibrary.org/b/id/8269931-L.jpg",
    "la casa de los espíritus": "https://covers.openlibrary.org/b/id/3205226-L.jpg",
    "eva luna": "https://covers.openlibrary.org/b/id/8267710-L.jpg",
    "el túnel": "https://covers.openlibrary.org/b/id/5517733-L.jpg",
    "sobre héroes y tumbas": "https://covers.openlibrary.org/b/id/8274411-L.jpg",
    "la muerte de artemio cruz": "https://covers.openlibrary.org/b/id/8233119-L.jpg",
    "aura": "https://covers.openlibrary.org/b/id/8269550-L.jpg",
    "bodas de sangre": "https://covers.openlibrary.org/b/id/8232991-L.jpg",
    "la casa de bernarda alba": "https://covers.openlibrary.org/b/id/8233441-L.jpg",
    "romancero gitano": "https://covers.openlibrary.org/b/id/8234015-L.jpg",
    "veinte poemas de amor y una canción desesperada": "https://covers.openlibrary.org/b/id/8233771-L.jpg",
    "canto general": "https://covers.openlibrary.org/b/id/8235612-L.jpg",
    "el laberinto de la soledad": "https://covers.openlibrary.org/b/id/8234882-L.jpg",
    "rimas y leyendas": "https://covers.openlibrary.org/b/id/8232551-L.jpg",
    "fortunata y jacinta": "https://covers.openlibrary.org/b/id/8233880-L.jpg",
    "marianela": "https://covers.openlibrary.org/b/id/8232114-L.jpg",
    "como agua para chocolate": "https://covers.openlibrary.org/b/id/8234661-L.jpg",
    "cuentos de la selva": "https://covers.openlibrary.org/b/id/8235220-L.jpg",
    "cuentos de amor de locura y de muerte": "https://covers.openlibrary.org/b/id/8233990-L.jpg",
    "la sombra del viento": "https://covers.openlibrary.org/b/id/8234190-L.jpg",
    "el juego del ángel": "https://covers.openlibrary.org/b/id/8267990-L.jpg",
    "marina": "https://covers.openlibrary.org/b/id/8269110-L.jpg",
    "la tregua": "https://covers.openlibrary.org/b/id/8233660-L.jpg",
    "la vida es sueño": "https://covers.openlibrary.org/b/id/8232881-L.jpg",
    "fuenteovejuna": "https://covers.openlibrary.org/b/id/8232770-L.jpg",
    "la celestina": "https://covers.openlibrary.org/b/id/8232660-L.jpg",
    "lazarillo de tormes": "https://covers.openlibrary.org/b/id/8232440-L.jpg",
    "los heraldos negros": "https://covers.openlibrary.org/b/id/8233550-L.jpg",
    "trilce": "https://covers.openlibrary.org/b/id/8234220-L.jpg",
    "tradiciones peruanas": "https://covers.openlibrary.org/b/id/8233220-L.jpg",
    "los ríos profundos": "https://covers.openlibrary.org/b/id/8233779-L.jpg",
    "niebla": "https://covers.openlibrary.org/b/id/8233005-L.jpg",
    "el árbol de la ciencia": "https://covers.openlibrary.org/b/id/8233667-L.jpg",
    "luces de bohemia": "https://covers.openlibrary.org/b/id/8232999-L.jpg",
    "las venas abiertas de américa latina": "https://covers.openlibrary.org/b/id/8234330-L.jpg",
    "los detectives salvajes": "https://covers.openlibrary.org/b/id/8268550-L.jpg",
    "corazón tan blanco": "https://covers.openlibrary.org/b/id/8268770-L.jpg",
    "el capitán alatriste": "https://covers.openlibrary.org/b/id/8268220-L.jpg",
    "patria": "https://covers.openlibrary.org/b/id/8269880-L.jpg",
    "la metamorfosis": "https://covers.openlibrary.org/b/id/14073660-L.jpg",
    "el retrato de dorian gray": "https://covers.openlibrary.org/b/id/8061086-L.jpg",
    "1984": "https://covers.openlibrary.org/b/id/8745958-L.jpg",
    "un mundo feliz": "https://covers.openlibrary.org/b/id/8753238-L.jpg",
    "rebelión en la granja": "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    "el arte de la guerra": "https://covers.openlibrary.org/b/id/8231500-L.jpg"
  };

  let actualizados = 0;

  for (const b of books) {
    const key = b.titulo.toLowerCase().trim();
    let verifiedCover = manualVerifiedCovers[key];

    // Si no esta en manual, pero tiene /b/isbn/ en urlPortada, buscar con Open Library API
    if (!verifiedCover && (b.urlPortada?.includes("/b/isbn/") || !b.urlPortada || b.urlPortada.includes("placeholder"))) {
      try {
        const authorName = b.autores?.[0]?.nombre || "";
        const searchUrl = "https://openlibrary.org/search.json?title=" + encodeURIComponent(b.titulo) + (authorName ? "&author=" + encodeURIComponent(authorName) : "") + "&fields=title,cover_i&limit=3";
        const olRes = await fetch(searchUrl);
        if (olRes.ok) {
          const olData = await olRes.json();
          const found = olData.docs?.find(d => d.cover_i);
          if (found) {
            verifiedCover = "https://covers.openlibrary.org/b/id/" + found.cover_i + "-L.jpg";
          }
        }
      } catch (e) {}
    }

    if (verifiedCover && verifiedCover !== b.urlPortada) {
      console.log(`Corrigiendo portada de: "${b.titulo}" -> ${verifiedCover}`);
      b.urlPortada = verifiedCover;
      try {
        const putRes = await fetch(baseUrl + "/api/libros/" + b.id, {
          method: "PUT",
          headers,
          body: JSON.stringify(b)
        });
        if (putRes.ok) {
          actualizados++;
        }
      } catch (err) {
        console.error("Error al actualizar:", err.message);
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log("\n=================================");
  console.log("Portadas verificadas y actualizadas:", actualizados);
  console.log("=================================");
}

fixAllCovers();