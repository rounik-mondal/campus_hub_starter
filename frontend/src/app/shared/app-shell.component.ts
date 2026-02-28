import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { TokenService } from '../core/services/token.service';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  roles?: string[]; // optional = public
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {

  private tokenService = inject(TokenService);

  // ✅ Collapsible state (Angular 21 signal)
  isCollapsed = signal(false);

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }

  // ✅ MENU CONFIG
  private menuItems: MenuItem[] = [
    {
      label: 'EVENTS',
      icon: '⚡',
      path: '/events' // public
    },
    {
      label: 'CREATE EVENT',
      icon: '✦',
      path: '/admin/create-event',
      roles: ['college_admin', 'super_admin']
    },
    {
      label: 'DASHBOARD',
      icon: '🛠',
      path: '/admin/dashboard',
      roles: ['super_admin']
    }
  ];

  // ✅ Filter menu based on role
  get filteredMenu(): MenuItem[] {
    const role = this.tokenService.getUser()?.role;

    return this.menuItems.filter(item =>
      !item.roles || (role && item.roles.includes(role))
    );
  }
}