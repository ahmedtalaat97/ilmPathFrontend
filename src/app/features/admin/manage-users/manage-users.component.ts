import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <mat-card>
      <h2>Manage Users</h2>
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search users</mat-label>
        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="applySearch()" placeholder="Search by name or email">
        <button *ngIf="searchTerm" matSuffix mat-icon-button aria-label="Clear" (click)="clearSearch()">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>
      <table mat-table [dataSource]="filteredUsers" class="mat-elevation-z1" *ngIf="filteredUsers.length">
        <ng-container matColumnDef="userName">
          <th mat-header-cell *matHeaderCellDef>User Name</th>
          <td mat-cell *matCellDef="let user">{{ user.userName }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let user">{{ user.email }}</td>
        </ng-container>
        <ng-container matColumnDef="roles">
          <th mat-header-cell *matHeaderCellDef>Roles</th>
          <td mat-cell *matCellDef="let user">{{ user.roles ? user.roles.join(', ') : '' }}</td>
        </ng-container>
        <ng-container matColumnDef="isActive">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let user">
            <mat-icon [color]="user.isActive ? 'primary' : 'warn'">{{ user.isActive ? 'check_circle' : 'block' }}</mat-icon>
            {{ user.isActive ? 'Active' : 'Inactive' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let user">
            <button *ngIf="user.isActive" mat-icon-button color="warn" (click)="banUser(user)"><mat-icon>block</mat-icon></button>
            <button *ngIf="!user.isActive" mat-icon-button color="primary" (click)="unbanUser(user)"><mat-icon>undo</mat-icon></button>
            <button mat-icon-button color="primary" (click)="promoteUser(user)"><mat-icon>arrow_upward</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      <div *ngIf="!filteredUsers.length" class="empty-state">
        <mat-icon>person_off</mat-icon>
        <p>No users found.</p>
      </div>
    </mat-card>
  `,
  styles: [`
    mat-card { max-width: 900px; margin: 32px auto; padding: 24px; }
    .search-field {
      width: 350px;
      margin-bottom: 20px;
    }
  
    @media (max-width: 600px) {
      .search-field {
        width: 100%;
      }
    }
    table { width: 100%; margin-top: 16px; }
    .empty-state { text-align: center; color: #888; margin: 48px 0; }
    .empty-state mat-icon { font-size: 48px; margin-bottom: 8px; }
  `]
})
export class ManageUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  displayedColumns = ['userName', 'email', 'roles', 'isActive', 'actions'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe((users: any[]) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  applySearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(user =>
      (user.userName && user.userName.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredUsers = this.users;
  }

  banUser(user: any) {
    if (confirm(`Are you sure you want to ban ${user.userName}?`)) {
      this.adminService.banUser(user.id).subscribe({
        next: (resp) => {
          user.isActive = false;
          // Optionally show a snackbar/toast here
        },
        error: () => {
          alert('Failed to ban user.');
        }
      });
    }
  }

  promoteUser(user: any) {
    // TODO: Implement promote user
    alert('Promote user: ' + user.userName);
  }

  unbanUser(user: any) {
    if (confirm(`Are you sure you want to unban ${user.userName}?`)) {
      this.adminService.unbanUser(user.id).subscribe({
        next: (resp) => {
          user.isActive = true;
          // Optionally show a snackbar/toast here
        },
        error: () => {
          alert('Failed to unban user.');
        }
      });
    }
  }
} 