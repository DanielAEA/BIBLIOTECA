import requests

BASE_URL = "https://ciberbook-backend-production.up.railway.app/api"

# Get all books
r = requests.get(f"{BASE_URL}/libros")
if r.status_code == 200:
    libros = r.json()
    print(f"Total books found: {len(libros)}")

    if len(libros) > 11:
        # Keep the first 11, mark the rest for deletion
        to_delete = [l['id'] for l in libros[11:]]
        
        print(f"Deleting {len(to_delete)} excess books...")
        
        # Perform bulk delete
        r = requests.delete(f"{BASE_URL}/libros/bulk-delete", json=to_delete)
        if r.status_code == 200:
            print("Successfully deleted excess books. Exactly 11 remain.")
        else:
            print(f"Failed to delete books: {r.status_code}")
    else:
        print("Total books are already 11 or fewer.")
else:
    print(f"Failed to fetch books: {r.status_code}")
