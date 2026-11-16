let updatedLibros = 0;
let updatedEjemplares = 0;

db.libros.find({ "ejemplares.0": { $exists: true } }).forEach(libro => {
  let changed = false;
  const newEjemplares = libro.ejemplares.map(e => {
    let ejCopy = Object.assign({}, e);
    
    // Ensure id is present
    if (!ejCopy.id) {
      ejCopy.id = ejCopy._id || ejCopy.codigo || ("EJ-" + Math.floor(Math.random() * 100000));
      changed = true;
      updatedEjemplares++;
    }
    
    // Ensure _id is present
    if (!ejCopy._id) {
      ejCopy._id = ejCopy.id;
      changed = true;
    }
    
    // Ensure codigo is present
    if (!ejCopy.codigo) {
      ejCopy.codigo = ejCopy.id;
      changed = true;
    }
    
    return ejCopy;
  });
  
  if (changed) {
    db.libros.updateOne(
      { _id: libro._id },
      { $set: { ejemplares: newEjemplares } }
    );
    updatedLibros++;
  }
});

print(`Listo: ${updatedLibros} libros actualizados, ${updatedEjemplares} ejemplares corregidos.`);

// Verify
let nullCount = 0;
db.libros.find({ "ejemplares.0": { $exists: true } }).forEach(l => {
  l.ejemplares.forEach(e => {
    if (!e.id) nullCount++;
  });
});
print(`Ejemplares con id nulo después de la corrección: ${nullCount}`);
