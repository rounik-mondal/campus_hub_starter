import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CollegeService, College } from '../../core/services/college.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden">
  <!-- Background noise -->
  <div class="absolute inset-0 pointer-events-none opacity-5"></div>

  <div class="w-full max-w-lg relative z-10">

    <!-- Header with brutalist stamp -->
    <div class="relative text-center mb-6">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#60a5fa] border-4 border-black">
        ✦ Join Us
      </h1>
      <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
        CREATE YOUR ACCOUNT
      </p>
    </div>

    <!-- Outer Brutal Frame with color -->
    <div class="rounded-[2.5rem] border-4 border-black bg-[#60a5fa] p-4 shadow-[16px_16px_0px_#000]">
      <!-- Inner Clay Card -->
      <div class="rounded-[2rem] border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000]">

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Name -->
          <div class="space-y-2">
            <label class="text-sm font-black block">FULL NAME</label>
            <div class="relative">
              <input
                formControlName="name"
                type="text"
                placeholder="e.g., Alex Johnson"
                class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">👤</span>
            </div>
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <div class="mt-2 flex items-center gap-2 text-sm font-bold text-red-600 bg-[#fecaca] border-4 border-black px-3 py-2 rounded-xl shadow-[4px_4px_0px_#000]">
                <span>⚠️</span>
                <span>Name is required</span>
              </div>
            }
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label class="text-sm font-black block">EMAIL</label>
            <div class="relative">
              <input
                formControlName="email"
                type="email"
                placeholder="you@example.com"
                class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">📧</span>
            </div>
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <div class="mt-2 flex items-center gap-2 text-sm font-bold text-red-600 bg-[#fecaca] border-4 border-black px-3 py-2 rounded-xl shadow-[4px_4px_0px_#000]">
                <span>⚠️</span>
                <span>Valid email is required</span>
              </div>
            }
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
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <div class="mt-2 flex items-center gap-2 text-sm font-bold text-red-600 bg-[#fecaca] border-4 border-black px-3 py-2 rounded-xl shadow-[4px_4px_0px_#000]">
                <span>⚠️</span>
                <span>Password is required</span>
              </div>
            }
          </div>

          <!-- College Select -->
          <div class="space-y-2">
            <label class="text-sm font-black block">COLLEGE</label>
            <div class="relative">
              <select
                formControlName="collegeId"
                (change)="onCollegeChange()"
                class="w-full appearance-none rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
              >
                <option value="">Select college</option>
                @for (c of colleges; track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
                <option value="OTHER">Others (enter manually)</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">▼</span>
            </div>
          </div>

          <!-- Other College Name -->
          @if (showOtherCollege()) {
            <div class="space-y-2">
              <label class="text-sm font-black block">ENTER YOUR COLLEGE</label>
              <div class="relative">
                <input
                  formControlName="collegeName"
                  type="text"
                  placeholder="e.g., Springfields College"
                  class="w-full rounded-2xl border-4 border-black bg-white px-4 py-3 text-base font-bold shadow-[4px_4px_0px_#000] transition-all focus:translate-x-1 focus:translate-y-1 focus:shadow-none focus:outline-none"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">🏛️</span>
              </div>
            </div>
          }

          <!-- Error -->
          @if (error()) {
            <div class="rounded-2xl border-4 border-black bg-[#fecaca] px-4 py-3 text-sm font-bold shadow-[6px_6px_0px_#000] flex items-center gap-2">
              <span class="text-xl">❌</span>
              {{ error() }}
            </div>
          }

          <!-- Submit -->
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
              <span>⚡ REGISTER ⚡</span>
              <span class="text-2xl">🎉</span>
            }
          </button>

        </form>

        <!-- Footer -->
        <p class="text-sm font-black text-neutral-600 text-center mt-8">
          ALREADY HAVE AN ACCOUNT?
          <a
            routerLink="/login"
            class="inline-block ml-2 border-4 border-black px-3 py-1 bg-[#fde68a] shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            SIGN IN
          </a>
        </p>

      </div>
    </div>

    <!-- Decorative corner elements -->
    <div class="absolute -top-8 -left-8 w-16 h-16 bg-[#f472b6] border-4 border-black rounded-full shadow-[4px_4px_0px_#000] rotate-12 hidden lg:block"></div>
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
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private collegeService = inject(CollegeService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  showOtherCollege = signal(false);

  colleges: College[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    collegeId: [''],
    collegeName: [''],
  });

  ngOnInit() {
    this.collegeService.getColleges().subscribe({
      next: (res) => (this.colleges = res.colleges),
    });
  }

  onCollegeChange() {
    const value = this.form.get('collegeId')?.value;
    this.showOtherCollege.set(value === 'OTHER');

    if (value !== 'OTHER') {
      this.form.patchValue({ collegeName: '' });
    }
  }

  onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();

    const payload: any = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: 'student',
    };

    // conditional payload (IMPORTANT)
    if (raw.collegeId && raw.collegeId !== 'OTHER') {
      payload.collegeId = raw.collegeId;
    } else {
      payload.collegeName = raw.collegeName;
    }

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed');
      },
    });
  }
}