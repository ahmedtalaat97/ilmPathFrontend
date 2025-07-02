import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, Cart, CartItem } from '../cart.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('350ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('350ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  cart: Cart | null = null;
  loading = true;

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load cart.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
        this.loading = false;
      }
    });
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.courseId).subscribe({
      next: (cart) => {
        // Fallback: recalculate totalPrice if missing
        if (cart && (!cart.totalPrice || isNaN(cart.totalPrice))) {
          cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price, 0);
        }
        this.cart = cart;
        this.snackBar.open('Item removed from cart.', 'Close', { duration: 2000, panelClass: 'snackbar-success' });
      },
      error: () => {
        this.snackBar.open('Failed to remove item.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
      }
    });
  }

  proceedToCheckout() {
    this.snackBar.open('Checkout is not implemented yet.', 'Close', { duration: 2500, panelClass: 'snackbar-success' });
  }
}
