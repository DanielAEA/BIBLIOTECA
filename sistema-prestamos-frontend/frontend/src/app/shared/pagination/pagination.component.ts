import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() page: number = 0;
  @Input() size: number = 10;
  @Input() totalElements: number = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  get totalPages(): number {
    if (!this.size || this.size <= 0) return 0;
    return Math.ceil(this.totalElements / this.size);
  }

  get startItem(): number {
    if (this.totalElements === 0) return 0;
    return this.page * this.size + 1;
  }

  get endItem(): number {
    return Math.min((this.page + 1) * this.size, this.totalElements);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    if (total <= 1) return [1];

    const current = this.page + 1;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  goToPage(p: number | string): void {
    if (typeof p !== 'number') return;
    const target = p - 1;
    if (target < 0 || target >= this.totalPages || target === this.page) return;
    this.pageChange.emit(target);
  }

  previous(): void {
    if (this.page > 0) {
      this.pageChange.emit(this.page - 1);
    }
  }

  next(): void {
    if (this.page < this.totalPages - 1) {
      this.pageChange.emit(this.page + 1);
    }
  }

  onSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newSize = Number(target.value);
    if (newSize > 0) {
      this.sizeChange.emit(newSize);
    }
  }
}
