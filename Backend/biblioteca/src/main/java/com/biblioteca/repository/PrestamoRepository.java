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
        "{ '$unwind': '$libro_doc' }",
        "{ '$group': { '_id': '$libro_doc.titulo', 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }",
        "{ '$limit': 5 }"
    })
    List<org.bson.Document> findMostBorrowedBooks();

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'libros', 'localField': 'libro.$id', 'foreignField': '_id', 'as': 'libro_doc' } }",
        "{ '$unwind': '$libro_doc' }",
        "{ '$lookup': { 'from': 'generos', 'localField': 'libro_doc.genero._id', 'foreignField': '_id', 'as': 'gen_doc' } }",
        "{ '$unwind': '$gen_doc' }",
        "{ '$group': { '_id': '$gen_doc.nombre', 'total': { '$sum': 1 } } }",
        "{ '$sort': { 'total': -1 } }"
    })
    List<org.bson.Document> findLoansByGenre();

    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'usuarios', 'localField': 'usuario.$id', 'foreignField': '_id', 'as': 'usuario_doc' } }",
        "{ '$unwind': '$usuario_doc' }",
        "{ '$group': { '_id': '$usuario_doc.rol', 'total': { '$sum': 1 } } }",
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
        "{ '$unwind': '$libro_doc' }",
        "{ '$unwind': '$libro_doc.autores' }",
        "{ '$lookup': { 'from': 'autores', 'localField': 'libro_doc.autores._id', 'foreignField': '_id', 'as': 'aut_doc' } }",
        "{ '$unwind': '$aut_doc' }",
        "{ '$group': { '_id': '$aut_doc.nombre', 'total': { '$sum': 1 } } }",
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
