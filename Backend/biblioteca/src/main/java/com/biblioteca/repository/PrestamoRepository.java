package com.biblioteca.repository;

import com.biblioteca.entity.Prestamo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import java.util.List;
import java.time.LocalDateTime;

public interface PrestamoRepository extends MongoRepository<Prestamo, String> {

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBefore(LocalDateTime fecha);

    List<Prestamo> findByUsuarioId(String usuarioId);

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'libros', 'localField': 'libro.$id', 'foreignField': '_id', 'as': 'libro_doc' } }",
        "{ '$unwind': { 'path': '$libro_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$group': { '_id': '$libro_doc.titulo', 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }",
        "{ '$limit': 5 }"
    })
    List<org.bson.Document> findMostBorrowedBooks();

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'libros', 'localField': 'libro.$id', 'foreignField': '_id', 'as': 'libro_doc' } }",
        "{ '$unwind': { 'path': '$libro_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$lookup': { 'from': 'generos', 'localField': 'libro_doc.genero', 'foreignField': '_id', 'as': 'gen_doc' } }",
        "{ '$unwind': { 'path': '$gen_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$group': { '_id': { '$ifNull': [ '$gen_doc.nombre', 'Sin Género' ] }, 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }"
    })
    List<org.bson.Document> findLoansByGenre();

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'usuarios', 'localField': 'usuario.$id', 'foreignField': '_id', 'as': 'usuario_doc' } }",
        "{ '$unwind': { 'path': '$usuario_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$group': { '_id': { '$ifNull': [ '$usuario_doc.rol', 'Sin Rol' ] }, 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }"
    })
    List<org.bson.Document> findLoansByUserRole();

    @Aggregation(pipeline = {
        "{ '$group': { '_id': { '$dateToString': { 'format': '%Y-%m', 'date': '$fechaPrestamo' } }, 'total': { '$sum': 1 } } }",
        "{ '$sort': { '_id': 1 } }"
    })
    List<org.bson.Document> findLoansByMonth();

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'libros', 'localField': 'libro.$id', 'foreignField': '_id', 'as': 'libro_doc' } }",
        "{ '$unwind': { 'path': '$libro_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$unwind': { 'path': '$libro_doc.autores', 'preserveNullAndEmptyArrays': true } }",
        "{ '$lookup': { 'from': 'autores', 'localField': 'libro_doc.autores', 'foreignField': '_id', 'as': 'aut_doc' } }",
        "{ '$unwind': { 'path': '$aut_doc', 'preserveNullAndEmptyArrays': true } }",
        "{ '$group': { '_id': { '$ifNull': [ '$aut_doc.nombre', 'Autor Desconocido' ] }, 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }",
        "{ '$limit': 5 }"
    })
    List<org.bson.Document> findMostBorrowedAuthors();

    @Aggregation(pipeline = {
        "{ '$match': { 'multa': { '$exists': true } } }",
        "{ '$group': { '_id': '$multa.pagada', 'total': { '$sum': '$multa.total' }, 'cantidad': { '$sum': 1 } } }"
    })
    List<org.bson.Document> findFinesStats();

    @Aggregation(pipeline = {
        "{ '$group': { '_id': '$estado', 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }"
    })
    List<org.bson.Document> findLoansByStatus();

    long countByDevueltoFalse();

    List<Prestamo> findByDevueltoFalseAndFechaDevolucionBetween(LocalDateTime start, LocalDateTime end);
}
