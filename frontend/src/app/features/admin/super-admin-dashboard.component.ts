// super-admin-dashboard.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CollegeService } from '../../core/services/college.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  
  <!-- Background noise (optional) -->
  <div class="absolute inset-0 pointer-events-none opacity-5"></div>

  <div class="max-w-6xl mx-auto space-y-10 relative z-10">

    <!-- Header with brutalist stamp -->
    <div class="relative text-center">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#f472b6] border-4 border-black">
        ⚡ Super Admin
      </h1>
      <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
        PLATFORM COMMAND CENTER
      </p>
    </div>

    <!-- Stats Section -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

      <!-- Total Colleges -->
      <div class="stat-card bg-[#f472b6]">
        <div class="flex items-start justify-between">
          <span class="stat-icon">🏛️</span>
          <span class="stat-value">{{ totalColleges() }}</span>
        </div>
        <p class="stat-label">TOTAL COLLEGES</p>
      </div>

      <!-- Total Events -->
      <div class="stat-card bg-[#4ade80]">
        <div class="flex items-start justify-between">
          <span class="stat-icon">🎉</span>
          <span class="stat-value">{{ totalEvents() }}</span>
        </div>
        <p class="stat-label">TOTAL EVENTS</p>
      </div>

      <!-- College Admins -->
      <div class="stat-card bg-[#fde68a]">
        <div class="flex items-start justify-between">
          <span class="stat-icon">👥</span>
          <span class="stat-value">{{ totalAdmins() }}</span>
        </div>
        <p class="stat-label">COLLEGE ADMINS</p>
      </div>

    </div>

    <!-- Quick Actions with brutalist frame -->
    <div class="rounded-[2.5rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">
      
      <div class="rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">

        <h2 class="text-2xl font-black mb-8 flex items-center gap-2">
          <span class="text-3xl">🚀</span> QUICK ACTIONS
          <span class="text-3xl">🚀</span>
        </h2>

        <div class="grid gap-6 sm:grid-cols-2">

          <!-- Create College -->
          <a
            routerLink="/admin/create-college"
            class="action-card bg-[#fde68a] group"
          >
            <span class="text-4xl mr-3">🏫</span>
            <span>CREATE COLLEGE</span>
            <span class="ml-2 text-xl opacity-50 group-hover:opacity-100 transition-opacity">→</span>
          </a>

          <!-- Create College Admin -->
          <a
            routerLink="/admin/create-college-admin"
            class="action-card bg-[#bbf7d0] group"
          >
            <span class="text-4xl mr-3">👤</span>
            <span>CREATE ADMIN</span>
            <span class="ml-2 text-xl opacity-50 group-hover:opacity-100 transition-opacity">→</span>
          </a>

        </div>

        <!-- Optional: extra decoration -->
        <div class="mt-8 text-center text-xs font-bold text-neutral-500 border-t-4 border-black pt-4">
          ✦ MANAGE YOUR CAMPUS NETWORK ✦
        </div>

      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
    .stat-card {
      border: 4px solid black;
      border-radius: 2rem;
      padding: 1.5rem;
      box-shadow: 12px 12px 0px #000;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-card:hover {
      transform: translate(4px, 4px);
      box-shadow: 6px 6px 0px #000;
    }

    .stat-icon {
      font-size: 2.5rem;
      line-height: 1;
    }

    .stat-value {
      font-size: 3rem;
      font-weight: 900;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .action-card {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      font-size: 1.2rem;
      font-weight: 900;
      border: 4px solid black;
      border-radius: 2rem;
      box-shadow: 8px 8px 0px #000;
      text-decoration: none;
      color: black;
      transition: all 0.15s ease;
      padding: 0 1.5rem;
    }

    .action-card:hover {
      transform: translate(6px, 6px);
      box-shadow: none;
    }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {

  private collegeService = inject(CollegeService);
  private eventService = inject(EventService);

  totalColleges = signal(0);
  totalEvents = signal(0);
  totalAdmins = signal(0);

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    // Load total colleges
    this.collegeService.getColleges().subscribe({
      next: (res) => this.totalColleges.set(res.colleges.length),
    });

    // Load total events
    this.eventService.getEvents().subscribe({
      next: (res: any) => this.totalEvents.set(res.events?.length || 0),
    });

    // Load total admins (example: using same endpoint, adjust as needed)
    this.collegeService.getAdmins().subscribe({
      next: (res) => this.totalAdmins.set(res.admins.length), // placeholder – replace with actual admin count
    });
  }
}