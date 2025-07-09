import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, Cart, CartItem } from '../cart.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';
import { StripePaymentService } from '../../../core/services/stripe-payment.service';
import { environment } from '../../../../environments/environment';

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
  private stripePaymentService = inject(StripePaymentService);

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

  async proceedToCheckout() {
    if (!this.cart || this.cart.items.length === 0) {
      this.snackBar.open('Your cart is empty.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
      return;
    }
    this.loading = true;
    const successUrl = window.location.origin + '/checkout-success';
    const cancelUrl = window.location.origin + '/cart';
    this.stripePaymentService.createCheckoutSession(successUrl, cancelUrl).subscribe({
      next: async (res) => {
        // Option 1: Redirect using checkoutUrl
console.log(res.sessionId);
        window.location.href = res.checkoutUrl;
        // Option 2: If you want to use Stripe.js, uncomment below:
        // const stripe = await loadStripe(environment.stripePublishableKey);
        // if (stripe) {
        //   stripe.redirectToCheckout({ sessionId: res.sessionId });
        // }
      },
      error: () => {
        this.snackBar.open('Failed to initiate checkout.', 'Close', { duration: 2500, panelClass: 'snackbar-error' });
        this.loading = false;
      }
    });
  }
}
