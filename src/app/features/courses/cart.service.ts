import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CartItem {
  courseId: number;
  title: string;
  price: number;
  thumbnailImageUrl: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = environment.apiUrl + '/Carts';

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();
  cartCount$ = this.cart$.pipe(map(cart => cart?.items.length || 0));

  constructor(private http: HttpClient) {}

  initCart() {
    this.getCart().subscribe();
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(courseId: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { courseId }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeFromCart(courseId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${courseId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }
} 