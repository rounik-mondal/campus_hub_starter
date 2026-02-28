import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TokenService } from '../core/services/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <header class="border-b-4 border-black bg-white shadow-[0_6px_0_#000]">
    <div class="flex h-20 items-center justify-between px-6 sm:px-10">
      
      <!-- Brand -->
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl border-4 border-black bg-[#fde68a] font-black shadow-[4px_4px_0_#000]">
          🎓
        </div>
        <span class="text-xl font-black tracking-tight">CampusHub</span>
      </div>

      <!-- Right side -->
      <div class="flex items-center gap-4">
        @if (!isLoggedIn()) {
          <a
            routerLink="/login"
            class="rounded-2xl border-4 border-black bg-white px-6 py-2 text-sm font-bold text-black shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-amber-500 hover:text-white"
          >
            LOGIN
          </a>
        } @else {
          <button
            (click)="logout()"
            class="rounded-2xl border-4 border-black bg-[#fecaca] px-6 py-2 text-sm font-bold shadow-[4px_4px_0_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-red-500 hover:text-white"
          >
            LOGOUT
          </button>
        }
      </div>

    </div>
  </header>
  `,
})
export class NavbarComponent {
  private tokenService = inject(TokenService);
  private router = inject(Router);

  isLoggedIn = this.tokenService.isLoggedIn;

  logout() {
    this.tokenService.clear();
    this.router.navigate(['/login']);
  }
}