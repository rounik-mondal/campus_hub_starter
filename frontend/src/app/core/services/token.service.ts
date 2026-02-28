import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private TOKEN_KEY = 'token';
  private USER_KEY = 'user';

  private _token = signal<string | null>(
    localStorage.getItem(this.TOKEN_KEY)
  );

  isLoggedIn = computed(() => !!this._token());

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  setUser(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getToken() {
    return this._token();
  }

  getUser() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
  }
}