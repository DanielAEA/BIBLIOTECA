USE biblioteca;

INSERT INTO rol_usuarios (nombre) VALUES 
('ADMIN'),
('CLIENTE');

INSERT INTO permisos (nombre) VALUES 
('GESTIONAR_LIBROS'),
('GESTIONAR_USUARIOS'),
('REALIZAR_PRESTAMOS');

INSERT INTO rol_permisos VALUES 
(1, 1),
(1, 2),
(2, 3);

-- Los usuarios se crean automáticamente desde la aplicación de forma segura (DataInitializer.java)
-- INSERT INTO usuarios (nombre, correo, password, rol_id) VALUES
-- ('Administrador', 'admin@bib.com', '1234', 1),
-- ('Angel Hernandez', 'angel@bib.com', '1234', 2),
-- ('Juan Ochoa', 'juan@bib.com', '1234', 2),
-- ('Luis Taborda', 'luis@bib.com', '1234', 2);

INSERT INTO precio_multas (valor_por_dia, vigente_desde) VALUES
(2000, '2024-01-01'),
(2500, '2024-06-01'),
(3000, '2025-01-01');

INSERT INTO autores (nombre) VALUES
('Gabriel García Márquez'),
('J. K. Rowling'),
('Stephen King');

INSERT INTO generos (nombre) VALUES
('Novela'),
('Fantasía'),
('Terror');

INSERT INTO editoriales (nombre) VALUES
('Norma'),
('Watppad'),
('Shonen');

INSERT INTO libros (titulo, genero_id, editorial_id, isbn, publicacion) VALUES
('Cien Años de Soledad', 1, 3, '978958888', '1967'),
('Harry Potter y la Piedra Filosofal', 2, 2, '978847888', '1997'),
('El Resplandor', 3, 1, '978030774', '1977');

INSERT INTO libro_autores VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO ejemplares (codigo, libro_id, disponible) VALUES
('LIB001-001', 1, TRUE),
('LIB001-002', 1, TRUE),
('LIB002-001', 2, TRUE);

INSERT INTO prestamos (usuario_id, ejemplar_id, fecha_prestamo, fecha_devolucion, devuelto) VALUES
(2, 1, '2025-01-10', '2025-01-25', FALSE),
(3, 2, '2025-01-05', '2025-01-20', TRUE),
(2, 3, '2025-01-12', '2025-01-27', FALSE);

INSERT INTO multas (prestamo_id, precio_multa_id, dias_atraso, total) VALUES
(1, 3, 5, 7500),
(2, 2, 2, 2400),
(3, 1, 1, 1000);
select* FROM multas;