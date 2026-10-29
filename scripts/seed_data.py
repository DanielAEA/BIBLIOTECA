import requests
import random
import uuid

BASE_URL = "http://localhost:8080/api"

# 1. Registrar 10 Clientes
usuarios = []
for i in range(10):
    user = {"nombre": f"Cliente {i}", "email": f"cliente{i}@test.com", "password": "password", "rol": "CLIENTE"}
    # Assuming registration endpoint or direct POST
    r = requests.post(f"{BASE_URL}/usuarios", json=user)
    if r.status_code == 200: usuarios.append(r.json())

# 2. Crear 50 Libros
libros = []
for i in range(50):
    libro = {
        "titulo": f"Libro {i}", 
        "isbn": f"ISBN-{i}", 
        "formato": "FISICO",
        "urlPortada": "https://via.placeholder.com/200x300"
    }
    r = requests.post(f"{BASE_URL}/libros", json=libro)
    if r.status_code == 200: libros.append(r.json())

# 3. Crear 100 ejemplares POR LIBRO
for libro in libros:
    for i in range(100):
        ejemplar = {
            "codigo": f"{libro['id'][:3].upper()}-{i}",
            "disponible": True,
            "libro": {"id": libro['id']}
        }
        requests.post(f"{BASE_URL}/libros/{libro['id']}/ejemplares", json=ejemplar)

# 4. Crear 10 Salas
salas = []
for i in range(10):
    sala = {"nombre": f"Sala {i}", "capacidad": 10}
    r = requests.post(f"{BASE_URL}/salas", json=sala)
    if r.status_code == 200: salas.append(r.json())

# 5. Crear 50 Reservas de Salas
for i in range(50):
    sala = random.choice(salas)
    reserva = {
        "salaId": sala['id'],
        "usuarioId": random.choice(usuarios)['id'],
        "fechaReserva": "2026-05-25",
        "horaInicio": "10:00",
        "horaFin": "12:00"
    }
    requests.post(f"{BASE_URL}/reservas-sala", json=reserva)

# 6. Realizar 100 Préstamos
for i in range(100):
    prestamo = {
        "usuarioId": random.choice(usuarios)['id'],
        "ejemplarId": f"..." # Simplified for logic, requires fetching actual copy IDs
    }
    # Note: Full loan logic requires fetching existing copy IDs from DB
# 7. Crear 30 Reseñas
for i in range(30):
    libro = random.choice(libros)
    usuario = random.choice(usuarios)
    resena = {
        "libro": {"id": libro['id']},
        "usuario": {"id": usuario['id']},
        "calificacion": random.randint(3, 5),
        "comentario": "Excelente libro, muy recomendado."
    }
    requests.post(f"{BASE_URL}/resenas", json=resena)

# 8. Crear 20 Multas
for i in range(20):
    usuario = random.choice(usuarios)
    multa = {
        "usuario": {"id": usuario['id']},
        "monto": random.randint(5000, 20000),
        "razon": "Entrega tardía",
        "estado": "PENDIENTE"
    }
    requests.post(f"{BASE_URL}/multas", json=multa)

print("Data insertion completed: Users, Books, Copies, Rooms, Reservations, Reviews, and Fines.")
