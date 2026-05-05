import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { BookService, Libro, LibroPayload } from '../../../services/book.service';
import { AuthorService, Autor } from '../../../services/author.service';
import { EditorialService, Editorial } from '../../../services/editorial.service';
import { GeneroService, Genero } from '../../../services/genero.service';
import { AuthService } from '../../../services/auth.service';
import { StatsService } from '../../../services/stats.service';
import Swal from 'sweetalert2';
import { BookCoverUploadComponent } from './book-cover-upload.component';

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCoverUploadComponent],
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.scss']
})
export class LibrosComponent implements OnInit {

  books: Libro[] = [];
  authors: Autor[] = [];
  editorials: Editorial[] = [];
  generos: Genero[] = [];
  loading = true;
  error: string | null = null;
  editingBook: Libro | null = null;
  showEditForm = false;
  showCreateForm = false;
  selectedAuthorIds: string[] = [];
  selectedEditorialId: string | null = null;
  selectedGeneroId: string | null = null;
  newAuthorName = '';
  newEditorialName = '';
  newGeneroName = '';
  addingAuthor = false;
  addingEditorial = false;
  addingGenero = false;
  submitting = false;
  authorsExpanded = false;
  selectedAuthorDropdown: string | null = null;
  selectedFile: File | null = null;

  // New features: View toggle and bulk selection
  isListView = false;
  selectedBookIds: Set<string> = new Set();

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private editorialService: EditorialService,
    private generoService: GeneroService,
    private authService: AuthService,
    private statsService: StatsService,
    private router: Router
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
        this.error = 'No se pudieron cargar los libros.';
        this.loading = false;
      }
    });
  }

  loadMetadata() {
    this.authorService.getAll().subscribe({
      next: (authors) => (this.authors = authors)
    });
    this.editorialService.getAll().subscribe({
      next: (editorials) => (this.editorials = editorials)
    });
    this.generoService.getAll().subscribe({
      next: (generos) => (this.generos = generos)
    });
  }

  editBook(book: Libro) {
    this.editingBook = { ...book };
    this.selectedAuthorIds = book.autores?.map((a) => a.id) ?? [];
    this.selectedEditorialId = book.editorial?.id ?? null;
    this.selectedGeneroId = book.genero?.id ?? null;
    this.showEditForm = true;
    this.showCreateForm = false;
  }

  createBook() {
    this.editingBook = {
      id: '',
      titulo: '',
      stockDisponible: 1,
      autores: [],
      editorial: undefined,
      genero: undefined,
      formato: 'FISICO',
      isbn: '',
      urlPortada: ''
    };
    this.selectedAuthorIds = [];
    this.selectedEditorialId = null;
    this.selectedGeneroId = null;
    this.selectedFile = null;
    this.showCreateForm = true;
    this.showEditForm = false;
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
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    }
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
      formato: this.editingBook.formato || 'FISICO',
      isbn: this.editingBook.isbn,
      urlPortada: this.editingBook.urlPortada
    };

    const handleUpload = (bookId: string, isNew: boolean) => {
      if (this.selectedFile && this.editingBook?.formato !== 'FISICO') {
        this.bookService.uploadPdf(bookId, this.selectedFile).subscribe({
          next: () => this.finishSave('¡Éxito!', `Libro guardado.`),
          error: (err) => {
            console.error('[PDF UPLOAD ERROR]', err);
            const msg = err.error?.error || err.message || 'Error desconocido al subir el archivo.';
            this.finishSave('¡Error PDF!', `Libro guardado, pero el PDF falló: ${msg}`);
          }
        });
      } else {
        this.finishSave('¡Éxito!', `Libro guardado correctamente.`);
      }
    };

    if (this.showCreateForm) {
      this.bookService.createBook(payload).subscribe({
        next: (res) => handleUpload(res.id, true),
        error: () => { this.submitting = false; Swal.fire('Error', 'No se pudo crear.', 'error'); }
      });
    } else {
      this.bookService.updateBook(this.editingBook.id, payload).subscribe({
        next: (res) => handleUpload(res.id, false),
        error: () => { this.submitting = false; Swal.fire('Error', 'No se pudo actualizar.', 'error'); }
      });
    }
  }

  private finishSave(title: string, text: string) {
    this.submitting = false;
    this.loadBooks();
    this.cancelEdit();
    Swal.fire({ title, text, icon: title === '¡Éxito!' ? 'success' : 'warning', timer: 2000, showConfirmButton: false });
  }

  deleteBook(book: Libro) {
    Swal.fire({
      title: '¿Eliminar?',
      text: book.titulo,
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.bookService.deleteBook(book.id).subscribe({
          next: () => { this.loadBooks(); Swal.fire('Eliminado', '', 'success'); }
        });
      }
    });
  }

  leerOnline(libro: Libro) {
    if (libro.archivoDigital) {
      window.open(libro.archivoDigital, '_blank');
    }
  }

  getAuthorsString(book: Libro): string {
    if (!book.autores || book.autores.length === 0) return 'Sin autor';
    return book.autores.map(a => a.nombre).join(', ');
  }

  getEditorialName(book: Libro): string {
    return book.editorial?.nombre || 'Sin editorial';
  }

  getAuthorName(id: string): string {
    return this.authors.find(a => a.id === id)?.nombre || 'Autor desconocido';
  }

  addAuthorFromDropdown() {
    if (this.selectedAuthorDropdown && !this.selectedAuthorIds.includes(this.selectedAuthorDropdown)) {
      this.selectedAuthorIds = [...this.selectedAuthorIds, this.selectedAuthorDropdown];
      this.selectedAuthorDropdown = null;
    }
  }

  removeAuthor(id: string) {
    this.selectedAuthorIds = this.selectedAuthorIds.filter(aid => aid !== id);
  }

  getAvailableAuthors(): Autor[] {
    return this.authors.filter(a => !this.selectedAuthorIds.includes(a.id));
  }

  addNewAuthor() {
    if (!this.newAuthorName.trim()) return;
    
    // Check if it already exists in the list
    const existing = this.authors.find(a => a.nombre.toLowerCase() === this.newAuthorName.trim().toLowerCase());
    if (existing) {
      if (!this.selectedAuthorIds.includes(existing.id)) {
        this.selectedAuthorIds = [...this.selectedAuthorIds, existing.id];
      }
      this.newAuthorName = '';
      return;
    }

    this.addingAuthor = true;
    this.authorService.create(this.newAuthorName).subscribe({
      next: (autor) => {
        this.authors.push(autor);
        this.selectedAuthorIds = [...this.selectedAuthorIds, autor.id];
        this.newAuthorName = '';
        this.addingAuthor = false;
      }
    });
  }

  addNewEditorial() {
    if (!this.newEditorialName.trim()) return;

    const existing = this.editorials.find(e => e.nombre.toLowerCase() === this.newEditorialName.trim().toLowerCase());
    if (existing) {
      this.selectedEditorialId = existing.id;
      this.newEditorialName = '';
      return;
    }

    this.addingEditorial = true;
    this.editorialService.create(this.newEditorialName).subscribe({
      next: (ed) => {
        this.editorials.push(ed);
        this.selectedEditorialId = ed.id;
        this.newEditorialName = '';
        this.addingEditorial = false;
      }
    });
  }

  addNewGenero() {
    if (!this.newGeneroName.trim()) return;

    const existing = this.generos.find(g => g.nombre.toLowerCase() === this.newGeneroName.trim().toLowerCase());
    if (existing) {
      this.selectedGeneroId = existing.id;
      this.newGeneroName = '';
      return;
    }

    this.addingGenero = true;
    this.generoService.create(this.newGeneroName).subscribe({
      next: (gen) => {
        this.generos.push(gen);
        this.selectedGeneroId = gen.id;
        this.newGeneroName = '';
        this.addingGenero = false;
      }
    });
  }

  verDetalles(book: Libro) {
    this.router.navigate(['/admin/libros', book.id]);
  }

  onCoverUpdated(url: string) {
    if (this.editingBook) this.editingBook.urlPortada = url;
    this.loadBooks();
  }

  onMetadataFetched(data: any) {
    if (!this.editingBook) return;
    
    this.editingBook.titulo = data.titulo || this.editingBook.titulo;
    this.editingBook.urlPortada = data.urlPortada || this.editingBook.urlPortada;
    this.editingBook.descripcion = data.descripcion || this.editingBook.descripcion;
    this.editingBook.publicacion = data.publicacion || data.anio || this.editingBook.publicacion;
    
    if (data.autores && data.autores.length > 0) {
      data.autores.forEach((nombre: string) => {
        const existente = this.authors.find(a => a.nombre.toLowerCase() === nombre.toLowerCase());
        if (existente) {
          if (!this.selectedAuthorIds.includes(existente.id)) {
            this.selectedAuthorIds.push(existente.id);
          }
        } else {
          this.authorService.create(nombre).subscribe(a => {
            this.authors.push(a);
            this.selectedAuthorIds.push(a.id);
          });
        }
      });
    }

    if (data.editorial) {
      const existente = this.editorials.find(e => e.nombre.toLowerCase() === data.editorial.toLowerCase());
      if (existente) {
        this.selectedEditorialId = existente.id;
      } else {
        this.editorialService.create(data.editorial).subscribe(e => {
          this.editorials.push(e);
          this.selectedEditorialId = e.id;
        });
      }
    }

    if (data.genero) {
      const existente = this.generos.find(g => g.nombre.toLowerCase() === data.genero.toLowerCase());
      if (existente) {
        this.selectedGeneroId = existente.id;
      } else {
        this.generoService.create(data.genero).subscribe(g => {
          this.generos.push(g);
          this.selectedGeneroId = g.id;
        });
      }
    }
  }

  toggleView() {
    this.isListView = !this.isListView;
    this.selectedBookIds.clear();
  }

  toggleSelection(bookId: string) {
    if (this.selectedBookIds.has(bookId)) {
      this.selectedBookIds.delete(bookId);
    } else {
      this.selectedBookIds.add(bookId);
    }
  }

  toggleAll(event: any) {
    if (event.target.checked) {
      this.books.forEach(b => this.selectedBookIds.add(b.id));
    } else {
      this.selectedBookIds.clear();
    }
  }

  deleteSelectedBooks() {
    const count = this.selectedBookIds.size;
    if (count === 0) return;

    Swal.fire({
      title: '¿Eliminar seleccionados?',
      text: `Se eliminarán ${count} libros.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.bookService.bulkDeleteBooks(Array.from(this.selectedBookIds)).pipe(finalize(() => this.loading = false)).subscribe({
          next: () => {
            this.loadBooks();
            this.selectedBookIds.clear();
            Swal.fire('Eliminados', `${count} libros eliminados correctamente.`, 'success');
          },
          error: (err) => {
            console.error('Error deleting books:', err);
            Swal.fire('Error', 'No se pudieron eliminar los libros.', 'error');
            this.loadBooks();
          }
        });
      }
    });
  }
}
