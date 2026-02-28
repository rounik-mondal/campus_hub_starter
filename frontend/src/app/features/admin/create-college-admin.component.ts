import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  CollegeService,
  College,
} from '../../core/services/college.service';

@Component({
  selector: 'app-create-college-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen px-6 py-12 relative overflow-hidden">
      <!-- Background noise -->
      <div class="absolute inset-0 pointer-events-none opacity-5";></div>

      <div class="max-w-2xl mx-auto relative z-10">

        <!-- Header with brutalist stamp -->
        <div class="relative text-center mb-10">
          <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#f472b6] border-4 border-black">
            👤 New Admin
          </h1>
          <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
            ASSIGN TO A COLLEGE
          </p>
        </div>

        <!-- Form card with brutalist double frame -->
        <div class="rounded-[2.5rem] border-4 border-black bg-[#4ade80] p-4 shadow-[16px_16px_0px_#000]">
          <div class="rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

              <!-- Full Name -->
              <div class="space-y-2">
                <label class="text-sm font-black block">FULL NAME</label>
                <div class="relative">
                  <input
                    formControlName="name"
                    type="text"
                    placeholder="e.g., John Doe"
                    class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">👤</span>
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-2">
                <label class="text-sm font-black block">EMAIL</label>
                <div class="relative">
                  <input
                    formControlName="email"
                    type="email"
                    placeholder="admin@college.edu"
                    class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">📧</span>
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <label class="text-sm font-black block">PASSWORD</label>
                <div class="relative">
                  <input
                    formControlName="password"
                    type="password"
                    placeholder="••••••••"
                    class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">🔒</span>
                </div>
              </div>

              <!-- College -->
              <div class="space-y-2">
                <label class="text-sm font-black block">COLLEGE</label>
                <div class="relative">
                  <select
                    formControlName="collegeId"
                    class="w-full appearance-none rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  >
                    <option [ngValue]="null" disabled selected>Select college</option>
                    @for (c of colleges; track c.id) {
                      <option [ngValue]="c.id">{{ c.name }}</option>
                    }
                  </select>
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">▼</span>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full rounded-2xl border-4 border-black bg-[#f472b6] px-6 py-4 text-lg font-black shadow-[8px_8px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_#000] flex items-center justify-center gap-2"
              >
                @if (loading()) {
                  <span class="flex items-center gap-2">
                    <span class="inline-block h-5 w-5 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
                    CREATING...
                  </span>
                } @else {
                  <span>⚡ CREATE ADMIN ⚡</span>
                  <span class="text-2xl">👑</span>
                }
              </button>

              <!-- Back link -->
              <div class="text-center text-sm font-bold">
                <a routerLink="/admin/dashboard" class="inline-block border-4 border-black px-4 py-2 bg-[#fde68a] shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  ← BACK TO DASHBOARD
                </a>
              </div>

            </form>

          </div>
        </div>

        <!-- Decorative corner elements -->
        <div class="absolute -top-8 -left-8 w-16 h-16 bg-[#f472b6] border-4 border-black rounded-full shadow-[4px_4px_0px_#000] rotate-12 hidden lg:block"></div>
        <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-[#fde68a] border-4 border-black rounded-full shadow-[6px_6px_0px_#000] -rotate-6 hidden lg:block"></div>

      </div>
    </div>
  `,
  styles: [`
    /* Custom spinner */
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CreateCollegeAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private collegeService = inject(CollegeService);
  private router = inject(Router);

  loading = signal(false);
  colleges: College[] = [];

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    collegeId: [null as string | null, Validators.required],
  });

  ngOnInit() {
    this.collegeService.getColleges().subscribe({
      next: (res) => (this.colleges = res.colleges),
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const payload = {
      ...this.form.getRawValue(),
      role: 'college_admin',
    };

    this.collegeService.createCollegeAdmin(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/events']);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}