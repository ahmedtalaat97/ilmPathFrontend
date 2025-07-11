import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../courses/category.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface Category {
  id: number;
  name: string;
  slug: string;
  courseCount?: number;
}

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manage-categories.component.html',
  styleUrls: ['./manage-categories.component.css']
})
export class ManageCategoriesComponent implements OnInit {
  categories: Category[] = [];
  displayedColumns = ['name', 'slug', 'courseCount', 'actions'];
  loading = false;
  error = '';

  // For add/edit dialog
  dialogData: Partial<{ id: number; name: string; slug: string }> = {};
  isEdit = false;
  dialogOpen = false;
  dialogLoading = false;

  constructor(
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  openAddDialog(): void {
    this.dialogData = { name: '', slug: '' };
    this.isEdit = false;
    this.dialogOpen = true;
  }

  openEditDialog(category: Category): void {
    this.dialogData = { ...category };
    this.isEdit = true;
    this.dialogOpen = true;
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.dialogData = {};
    this.dialogLoading = false;
  }

  saveCategory(): void {
    if (!this.dialogData.name || !this.dialogData.slug || this.dialogLoading) return;
    this.dialogLoading = true;
    if (this.isEdit && this.dialogData.id != null) {
      this.categoryService.updateCategory(this.dialogData.id, {
        name: this.dialogData.name!,
        slug: this.dialogData.slug!
      }).subscribe({
        next: () => {
          this.snackBar.open('Category updated', 'Close', { duration: 2000 });
          this.closeDialog();
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Failed to update category', 'Close', { duration: 2000 });
          this.dialogLoading = false;
        }
      });
    } else {
      this.categoryService.createCategory({
        name: this.dialogData.name!,
        slug: this.dialogData.slug!
      }).subscribe({
        next: () => {
          this.snackBar.open('Category added', 'Close', { duration: 2000 });
          this.closeDialog();
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Failed to add category', 'Close', { duration: 2000 });
          this.dialogLoading = false;
        }
      });
    }
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.snackBar.open('Category deleted', 'Close', { duration: 2000 });
        this.loadCategories();
      },
      error: () => {
        this.snackBar.open('Failed to delete category', 'Close', { duration: 2000 });
      }
    });
  }
} 