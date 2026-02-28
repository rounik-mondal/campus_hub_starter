import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CollegeService } from '../../core/services/college.service';

@Component({
  selector: 'app-create-college',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen px-6 py-12 relative overflow-hidden">
      <!-- Background noise -->
      <div class="absolute inset-0 pointer-events-none opacity-5"></div>

      <div class="max-w-2xl mx-auto relative z-10">

        <!-- Header with brutalist stamp -->
        <div class="relative text-center mb-10">
          <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#4ade80] border-4 border-black">
            🏛️ New College
          </h1>
          <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
            ADD TO THE PLATFORM
          </p>
        </div>

        <!-- Form card with brutalist double frame -->
        <div class="rounded-[2.5rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">
          <div class="rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

              <!-- College Name -->
              <div class="space-y-2">
                <label class="text-sm font-black block">COLLEGE NAME</label>
                <div class="relative">
                  <input
                    formControlName="name"
                    type="text"
                    placeholder="e.g., Tech University"
                    class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">🏛️</span>
                </div>

                <!-- Error message -->
                @if (form.controls.name.touched && form.controls.name.invalid) {
                  <div class="mt-2 flex items-center gap-2 text-sm font-bold text-red-600 bg-[#fecaca] border-4 border-black px-3 py-2 rounded-xl shadow-[4px_4px_0px_#000]">
                    <span>⚠️</span>
                    <span>College name is required</span>
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full rounded-2xl border-4 border-black bg-[#4ade80] px-6 py-4 text-lg font-black shadow-[8px_8px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_#000] flex items-center justify-center gap-2"
              >
                @if (loading()) {
                  <span class="flex items-center gap-2">
                    <span class="inline-block h-5 w-5 border-4 border-black border-t-transparent rounded-full animate-spin"></span>
                    CREATING...
                  </span>
                } @else {
                  <span>⚡ CREATE COLLEGE ⚡</span>
                  <span class="text-2xl">🏛️</span>
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
        <div class="absolute -top-8 -left-8 w-16 h-16 bg-[#4ade80] border-4 border-black rounded-full shadow-[4px_4px_0px_#000] rotate-12 hidden lg:block"></div>
        <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-[#fde68a] border-4 border-black rounded-full shadow-[6px_6px_0px_#000] -rotate-6 hidden lg:block"></div>

      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CreateCollegeComponent {
  private fb = inject(FormBuilder);
  private collegeService = inject(CollegeService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    this.collegeService.createCollege(this.form.getRawValue()).subscribe({
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