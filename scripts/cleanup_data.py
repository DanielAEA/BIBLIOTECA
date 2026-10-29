import requests

BASE_URL = "https://ciberbook-backend-production.up.railway.app/api"

# Get all books
r = requests.get(f"{BASE_URL}/libros")
if r.status_code == 200:
    libros = r.json()
    # Filter for test books (assuming they follow the 'Libro i' pattern)
    test_books = [l['id'] for l in libros if l['titulo'].startswith('Libro')]
    
    print(f"Found {len(test_books)} test books to delete.")
    
    # Bulk delete
    if test_books:
        r = requests.delete(f"{BASE_URL}/libros/bulk-delete", json=test_books)
        if r.status_code == 200:
            print("Successfully deleted test books.")
        else:
            print(f"Failed to delete books: {r.status_code}")
else:
    print(f"Failed to fetch books: {r.status_code}")
