import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BookService, Libro, LibroPayload } from '../../../services/book.service';
import { AuthorService, Autor } from '../../../services/author.service';
import { EditorialService, Editorial } from '../../../services/editorial.service';
import { GeneroService, Genero } from '../../../services/genero.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {

  books: Libro[] = [];
  authors: Autor[] = [];
  editorials: Editorial[] = [];
  generos: Genero[] = [];
  loading = true;
  error: string | null = null;
  editingBook: Libro | null = null;
  showEditForm = false;
  showCreateForm = false;
  selectedAuthorIds: number[] = [];
  selectedEditorialId: number | null = null;
  selectedGeneroId: number | null = null;
  newAuthorName = '';
  newEditorialName = '';
  newGeneroName = '';
  addingAuthor = false;
  addingEditorial = false;
  addingGenero = false;
  submitting = false;
  authorsExpanded = false;
  selectedAuthorDropdown: number | null = null;
  selectedFile: File | null = null;

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private editorialService: EditorialService,
    private generoService: GeneroService
  ) { }

  ngOnInit() {
    this.loadBooks();
    this.loadMetadata();
  }

  loadBooks() {
    this.loading = true;
    this.error = null;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar libros:', err);
        this.error = 'No se pudieron cargar los libros. Verifica que el backend esté corriendo.';
        this.loading = false;
      }
    });
  }

  loadMetadata() {
    this.authorService.getAll().subscribe({
      next: (authors) => (this.authors = authors),
      error: (err) => console.error('Error al cargar autores:', err)
    });

    this.editorialService.getAll().subscribe({
      next: (editorials) => {
        console.log('Editoriales cargadas:', editorials);
        this.editorials = editorials;
      },
      error: (err) => {
        console.error('Error al cargar editoriales:', err);
        Swal.fire('Error', 'No se pudieron cargar las editoriales.', 'error');
      }
    });

    this.generoService.getAll().subscribe({
      next: (generos) => (this.generos = generos),
      error: (err) => console.error('Error al cargar géneros:', err)
    });
  }

  editBook(book: Libro) {
    this.editingBook = { ...book };
    this.selectedAuthorIds = book.autores?.map((a) => a.id) ?? [];
    this.selectedEditorialId = book.editorial?.id ?? null;
    this.selectedGeneroId = book.genero?.id ?? null;
    this.showEditForm = true;
    this.showCreateForm = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createBook() {
    this.editingBook = {
      id: 0,
      titulo: '',
      stockDisponible: 0,
      autores: [],
      editorial: undefined,
      genero: undefined,
      formato: 'FISICO'
    };
    this.selectedAuthorIds = [];
    this.selectedEditorialId = null;
    this.selectedGeneroId = null;
    this.selectedFile = null;
    this.showCreateForm = true;
    this.showEditForm = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingBook = null;
    this.showEditForm = false;
    this.showCreateForm = false;
    this.selectedAuthorIds = [];
    this.selectedEditorialId = null;
    this.selectedGeneroId = null;
    this.selectedFile = null;
    this.newAuthorName = '';
    this.newEditorialName = '';
    this.newGeneroName = '';
    this.authorsExpanded = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
        event.target.value = '';
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    }
  }

  toggleAuthors() {
    this.authorsExpanded = !this.authorsExpanded;
  }

  saveBook() {
    if (!this.editingBook) return;
    if (!this.selectedEditorialId) {
      Swal.fire('Atención', 'Selecciona una editorial.', 'warning');
      return;
    }
    if (!this.selectedGeneroId) {
      Swal.fire('Atención', 'Selecciona un género.', 'warning');
      return;
    }
    if (this.selectedAuthorIds.length === 0) {
      Swal.fire('Atención', 'Selecciona al menos un autor.', 'warning');
      return;
    }

    this.submitting = true;
    const payload: LibroPayload = {
      titulo: this.editingBook.titulo,
      autores: this.selectedAuthorIds.map((id) => ({ id })),
      editorial: this.selectedEditorialId ? { id: this.selectedEditorialId } : null,
      genero: this.selectedGeneroId ? { id: this.selectedGeneroId } : null,
      formato: this.editingBook.formato || 'FISICO'
    };

    const handleUpload = (bookId: number, isNew: boolean) => {
      if (this.selectedFile && this.editingBook?.formato !== 'FISICO') {
        this.bookService.uploadPdf(bookId, this.selectedFile).subscribe({
          next: () => this.finishSave('¡Éxito!', `Libro ${isNew ? 'creado' : 'actualizado'} y PDF subido correctamente.`),
          error: (err) => {
            console.error('Error al subir PDF:', err);
            this.finishSave('¡Advertencia!', `Libro guardado, pero falló la subida del PDF: ${err.error?.error || err.message}`);
          }
        });
      } else {
        this.finishSave('¡Éxito!', `Libro ${isNew ? 'creado' : 'actualizado'} correctamente.`);
      }
    };

    if (this.showCreateForm) {
      this.bookService.createBook(payload).subscribe({
        next: (res) => handleUpload(res.id, true),
        error: (err) => {
          this.submitting = false;
          console.error('Error al crear libro:', err);
          const errorMessage = err?.error?.message || err?.message || 'Error desconocido';
          Swal.fire('Error', `No se pudo crear el libro: ${errorMessage}`, 'error');
        }
      });
    } else {
      this.bookService.updateBook(this.editingBook.id, payload).subscribe({
        next: (res) => handleUpload(res.id, false),
        error: (err) => {
          this.submitting = false;
          console.error('Error al actualizar libro:', err);
          Swal.fire('Error', 'No se pudo actualizar el libro', 'error');
        }
      });
    }
  }

  private finishSave(title: string, text: string) {
    this.submitting = false;
    this.loadBooks();
    this.cancelEdit();
    Swal.fire({
      title,
      text,
      icon: title === '¡Éxito!' ? 'success' : 'warning',
      timer: 2000,
      showConfirmButton: false
    });
  }

  deleteBook(book: Libro) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Deseas eliminar el libro "${book.titulo}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(book.id).subscribe({
          next: () => {
            this.loadBooks();
            Swal.fire('¡Eliminado!', 'El libro ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar libro:', err);
            Swal.fire('Error', 'No se pudo eliminar el libro', 'error');
          }
        });
      }
    });
  }

  getAuthorsString(book: Libro): string {
    if (!book.autores || book.autores.length === 0) {
      return 'Sin autor';
    }
    return book.autores.map(a => a.nombre).join(', ');
  }

  getEditorialName(book: Libro): string {
    return book.editorial?.nombre || 'Sin editorial';
  }

  getSelectedAuthorsNames(): string {
    return this.selectedAuthorIds
      .map(id => this.authors.find(a => a.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  }

  addAuthorFromDropdown() {
    if (this.selectedAuthorDropdown && !this.selectedAuthorIds.includes(this.selectedAuthorDropdown)) {
      this.selectedAuthorIds = [...this.selectedAuthorIds, this.selectedAuthorDropdown];
      this.selectedAuthorDropdown = null;
    }
  }

  removeAuthor(id: number) {
    this.selectedAuthorIds = this.selectedAuthorIds.filter(aid => aid !== id);
  }

  getAuthorName(id: number): string {
    return this.authors.find(a => a.id === id)?.nombre || 'Autor desconocido';
  }

  getAvailableAuthors(): Autor[] {
    return this.authors.filter(a => !this.selectedAuthorIds.includes(a.id));
  }

  addNewAuthor() {
    const nombre = this.newAuthorName.trim();
    if (!nombre) {
      Swal.fire('Atención', 'Ingresa el nombre del autor.', 'warning');
      return;
    }
    this.addingAuthor = true;
    this.authorService.create(nombre).subscribe({
      next: (autor) => {
        this.authors.push(autor);
        this.selectedAuthorIds = [...this.selectedAuthorIds, autor.id];
        this.newAuthorName = '';
        this.authorsExpanded = false;
      },
      error: (err) => {
        console.error('Error al crear autor:', err);
        Swal.fire('Error', 'No se pudo crear el autor.', 'error');
      },
      complete: () => (this.addingAuthor = false)
    });
  }

  addNewEditorial() {
    const nombre = this.newEditorialName.trim();
    if (!nombre) {
      Swal.fire('Atención', 'Ingresa el nombre de la editorial.', 'warning');
      return;
    }
    this.addingEditorial = true;
    this.editorialService.create(nombre).subscribe({
      next: (editorial) => {
        this.editorials.push(editorial);
        this.selectedEditorialId = editorial.id;
        this.newEditorialName = '';
      },
      error: (err) => {
        console.error('Error al crear editorial:', err);
        Swal.fire('Error', 'No se pudo crear la editorial.', 'error');
      },
      complete: () => (this.addingEditorial = false)
    });
  }

  addNewGenero() {
    const nombre = this.newGeneroName.trim();
    if (!nombre) {
      Swal.fire('Atención', 'Ingresa el nombre del género.', 'warning');
      return;
    }
    this.addingGenero = true;
    this.generoService.create(nombre).subscribe({
      next: (genero) => {
        this.generos.push(genero);
        this.selectedGeneroId = genero.id;
        this.newGeneroName = '';
      },
      error: (err) => {
        console.error('Error al crear género:', err);
        Swal.fire('Error', 'No se pudo crear el género.', 'error');
      },
      complete: () => (this.addingGenero = false)
    });
  }
}
