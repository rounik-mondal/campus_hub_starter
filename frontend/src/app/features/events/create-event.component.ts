import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { EventService } from '../../core/services/event.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTimepickerModule,
    MatSnackBarModule,
  ],
    template: `
<div class="min-h-screen px-6 py-16 flex justify-center relative overflow-hidden">
  <!-- Brutalist background decoration -->
  <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#f472b6] rotate-12 border-8 border-black rounded-full opacity-30 pointer-events-none"></div>
  <div class="absolute -bottom-32 -right-20 w-96 h-96 bg-[#4ade80] -rotate-12 border-8 border-black rounded-full opacity-20 pointer-events-none"></div>

  <div class="w-full max-w-4xl space-y-10 relative z-10">

    <!-- Header with brutalist stamp -->
    <div class="relative text-center">
      <h1 class="text-6xl md:text-7xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-2 rotate-[-1deg] shadow-[8px_8px_0px_#f472b6] border-4 border-black">
        Create Event
      </h1>
      <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-2 border-black shadow-[4px_4px_0px_#000] rotate-[0.5deg]">
        ✦ fill it like it's hot ✦
      </p>
    </div>

    <!-- Brutal Frame with torn edge effect -->
    <div class="rounded-[3rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000] rotate-[0.2deg] relative">
      <!-- "NEW" badge -->
      <div class="absolute -top-5 -right-5 bg-[#4ade80] text-black font-black text-2xl px-4 py-2 border-4 border-black shadow-[6px_6px_0px_#000] rotate-6 z-20">
        NEW
      </div>

      <mat-card class="rounded-[2rem] border-4 border-black !bg-white shadow-[10px_10px_0px_#000] !p-8 md:!p-12 relative">
        <!-- Hand-drawn pattern overlay -->
        <div class="absolute inset-0 opacity-5 pointer-events-none"></div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8 relative">

          <!-- Title -->
          <mat-form-field appearance="outline" class="w-full brutal-input">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" />
            <mat-icon matPrefix>event</mat-icon>
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="outline" class="w-full brutal-input">
            <mat-label>Description</mat-label>
            <textarea matInput rows="4" formControlName="description"></textarea>
            <mat-icon matPrefix>description</mat-icon>
          </mat-form-field>

          <!-- Category & Location -->
          <div class="grid md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="brutal-input">
              <mat-label>Category</mat-label>
              <input matInput formControlName="category" />
              <mat-icon matPrefix>category</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="brutal-input">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" />
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>
          </div>

          <!-- Visibility -->
          @if (!isSuperAdmin()){
            <mat-form-field appearance="outline" class="w-full brutal-input">
              <mat-label>Visibility</mat-label>
              <mat-select formControlName="scope">
                <mat-option value="COLLEGE">🏛️ College Only</mat-option>
                <mat-option value="GLOBAL">🌍 Global</mat-option>
              </mat-select>
              <mat-icon matPrefix>visibility</mat-icon>
            </mat-form-field>
          }

          @if (isSuperAdmin()) {
            <mat-form-field appearance="outline" class="w-full brutal-input">
              <mat-label>Visibility</mat-label>
              <mat-select formControlName="scope">
                <mat-option value="GLOBAL">🌍 Global (Super Admin)</mat-option>
              </mat-select>
              <mat-icon matPrefix>visibility</mat-icon>
            </mat-form-field>
          }

          <!-- Schedule -->
          <div class="space-y-4 relative">
            <!-- Decorative clock icon -->
            <div class="absolute -left-4 -top-4 text-4xl rotate-12 opacity-20">⏰</div>

            @if (dateError()) {
              <div class="rounded-xl border-4 border-black bg-[#fecaca] px-6 py-4 text-base font-black shadow-[8px_8px_0px_#000] flex items-center gap-3 rotate-[-0.3deg]">
                <span class="text-2xl">⚠️</span>
                <span>End date & time must be after start date & time.</span>
              </div>
            }

            @if (duration()) {
              <div class="rounded-xl border-4 border-black bg-[#bbf7d0] px-6 py-4 text-base font-black shadow-[8px_8px_0px_#000] flex items-center gap-3 rotate-[0.5deg]">
                <span class="text-2xl">⏳</span>
                <span>Duration: {{ duration() }}</span>
              </div>
            }

            <div class="grid md:grid-cols-2 gap-6">

              <!-- Start -->
              <div class="space-y-4 p-4 border-4 border-black bg-[#fde68a] rounded-2xl shadow-[6px_6px_0px_#000]">
                <h3 class="font-black text-lg flex items-center gap-2">🚀 START</h3>
                <mat-form-field appearance="outline" class="w-full brutal-input">
                  <mat-label>Start Date</mat-label>
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full brutal-input">
                  <mat-label>Start Time</mat-label>
                  <input matInput [matTimepicker]="startTimePicker" formControlName="startTime" readonly />
                  <mat-timepicker-toggle matSuffix [for]="startTimePicker"></mat-timepicker-toggle>
                  <mat-timepicker #startTimePicker></mat-timepicker>
                </mat-form-field>
              </div>

              <!-- End -->
              <div class="space-y-4 p-4 border-4 border-black bg-[#fbc02d] rounded-2xl shadow-[6px_6px_0px_#000]">
                <h3 class="font-black text-lg flex items-center gap-2">🏁 END</h3>
                <mat-form-field appearance="outline" class="w-full brutal-input">
                  <mat-label>End Date</mat-label>
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full brutal-input">
                  <mat-label>End Time</mat-label>
                  <input matInput [matTimepicker]="endTimePicker" formControlName="endTime" readonly />
                  <mat-timepicker-toggle matSuffix [for]="endTimePicker"></mat-timepicker-toggle>
                  <mat-timepicker #endTimePicker></mat-timepicker>
                </mat-form-field>
              </div>

            </div>
          </div>

          <!-- Extra Configuration -->
          <div class="grid md:grid-cols-2 gap-6">
            <mat-form-field appearance="outline" class="brutal-input">
              <mat-label>Max Seats</mat-label>
              <input matInput type="number" formControlName="maxSeats" />
              <mat-icon matPrefix>event_seat</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="brutal-input">
             <mat-label>Ticket Price ($)</mat-label>
             <input matInput type="number" formControlName="ticketPrice" />
             <mat-icon matPrefix>attach_money</mat-icon>
            </mat-form-field>
          </div>
          
          <div class="grid md:grid-cols-2 gap-6 p-4 border-4 border-black bg-[#e0f2fe] shadow-[6px_6px_0px_#000] rounded-2xl mb-6">
            <label class="flex items-center gap-3 font-black cursor-pointer text-lg">
              <input type="checkbox" formControlName="isPaid" class="w-6 h-6 border-4 border-black accent-[#f472b6]">
              💸 Paid Event?
            </label>

            <label class="flex items-center gap-3 font-black cursor-pointer text-lg">
              <input type="checkbox" formControlName="isTeamEvent" class="w-6 h-6 border-4 border-black accent-[#4ade80]">
              🤝 Team Event?
            </label>
            
            @if(form.get('isTeamEvent')?.value) {
              <mat-form-field appearance="outline" class="brutal-input md:col-span-2 mt-4">
                <mat-label>Max Team Size</mat-label>
                <input matInput type="number" formControlName="maxTeamSize" />
                <mat-icon matPrefix>group</mat-icon>
              </mat-form-field>
            }
          </div>

          <!-- Submit -->
          <button
            mat-raised-button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full rounded-2xl border-4 border-black !bg-[#f472b6] text-black px-6 py-5 text-xl font-black shadow-[10px_10px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[10px_10px_0px_#000] flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <span class="flex items-center justify-center gap-3">
                <mat-spinner diameter="24" strokeWidth="3" color="warn"></mat-spinner>
                <span class="tracking-wider">CREATING...</span>
              </span>
            } @else {
              <span class="tracking-wider">⚡ CREATE EVENT ⚡</span>
              <span class="text-2xl">🎉</span>
            }
          </button>

        </form>
      </mat-card>
    </div>
  </div>
</div>
`,
  styles: [`
    /* Brutalist input style overrides */
    ::ng-deep .mat-mdc-form-field-outline {
      border-color: black !important;
      border-width: 3px !important;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: #fde68a !important;
      opacity: 0.3 !important;
    }
    .brutal-input .mat-mdc-text-field-wrapper {
      border-width: 3px !important;
    }
    /* Make input labels bold */
    ::ng-deep .mat-mdc-form-field-label {
      font-weight: 700 !important;
      color: black !important;
    }
    /* Increase size of icons */
    .mat-icon {
      transform: scale(1.2);
    }
    /* Ensure spinner is black */
    ::ng-deep .mat-mdc-progress-spinner circle {
      stroke: black !important;
    }
    /* Snackbar styles (add to global or here) */
    ::ng-deep .brutal-toast-success {
      background: #bbf7d0 !important;
      color: black !important;
      border: 4px solid black !important;
      font-weight: 800 !important;
      box-shadow: 8px 8px 0px black !important;
    }
    ::ng-deep .brutal-toast-error {
      background: #fecaca !important;
      color: black !important;
      border: 4px solid black !important;
      font-weight: 800 !important;
      box-shadow: 8px 8px 0px black !important;
    }
  `]
})
export class CreateEventComponent {

  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  dateError = signal(false);
  duration = signal<string | null>(null);

  // ✅ IMPORTANT: time is now Date | null (because MatTimepicker returns Date)
  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    category: ['', Validators.required],
    location: ['', Validators.required],
    scope: ['COLLEGE' as 'GLOBAL' | 'COLLEGE', Validators.required],
    collegeId: [''],
    startDate: [null as Date | null, Validators.required],
    startTime: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    endTime: [null as Date | null, Validators.required],
    maxSeats: [100, [Validators.required, Validators.min(1)]],
    isPaid: [false],
    ticketPrice: [0, Validators.min(0)],
    isTeamEvent: [false],
    maxTeamSize: [1, Validators.min(1)]
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.calculateDuration());
  }

  // ✅ FIXED (no split anymore)
  private calculateDuration() {
    const raw = this.form.getRawValue();

    if (!raw.startDate || !raw.startTime || !raw.endDate || !raw.endTime) {
      this.duration.set(null);
      this.dateError.set(false);
      return;
    }

    const start = new Date(raw.startDate);
    start.setHours(
      raw.startTime.getHours(),
      raw.startTime.getMinutes(),
      0,
      0
    );

    const end = new Date(raw.endDate);
    end.setHours(
      raw.endTime.getHours(),
      raw.endTime.getMinutes(),
      0,
      0
    );

    if (end <= start) {
      this.dateError.set(true);
      this.duration.set(null);
      return;
    }

    this.dateError.set(false);

    const diff = end.getTime() - start.getTime();
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    this.duration.set(
      hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    );
  }

  isSuperAdmin(): boolean {
    return this.tokenService.getUser()?.role === 'super_admin';
  }

  // ✅ FIXED submit logic
  onSubmit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);

    const raw = this.form.getRawValue();

    const start = new Date(raw.startDate!);
    start.setHours(
      raw.startTime!.getHours(),
      raw.startTime!.getMinutes(),
      0,
      0
    );

    const end = new Date(raw.endDate!);
    end.setHours(
      raw.endTime!.getHours(),
      raw.endTime!.getMinutes(),
      0,
      0
    );

    if (end < start) {
      this.loading.set(false);
      this.dateError.set(true);
      return;
    }

    const payload = {
      title: raw.title,
      description: raw.description,
      category: raw.category,
      location: raw.location,
      scope: this.isSuperAdmin() ? 'GLOBAL' : raw.scope,
      collegeId: raw.collegeId || undefined,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      maxSeats: raw.maxSeats,
      isPaid: raw.isPaid,
      ticketPrice: raw.ticketPrice,
      isTeamEvent: raw.isTeamEvent,
      maxTeamSize: raw.maxTeamSize
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('🎉 EVENT CREATED SUCCESSFULLY', 'OK', {
          duration: 3000,
          panelClass: ['brutal-toast-success']
        });
        this.router.navigate(['/events']);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('❌ FAILED TO CREATE EVENT', 'OK', {
          duration: 3000,
          panelClass: ['brutal-toast-error']
        });
      },
    });
  }
}