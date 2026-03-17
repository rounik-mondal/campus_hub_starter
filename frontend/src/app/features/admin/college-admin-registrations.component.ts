import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../core/services/event.service';
import { RegistrationService } from '../../core/services/registration.service';
import { EventItem } from '../../models/event.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-college-admin-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  <div class="max-w-6xl mx-auto space-y-10 relative z-10">
    <div class="relative text-center mb-10">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#f472b6] border-4 border-black">
        📋 Manage Registrations
      </h1>
    </div>

    <!-- Event Selector -->
    <div class="border-4 border-black bg-[#fde68a] p-6 shadow-[8px_8px_0px_#000] rounded-xl">
      <h2 class="text-2xl font-black mb-4">Select an Event</h2>
      @if (loadingEvents()) {
        <p class="font-bold">Loading events...</p>
      } @else {
        <select class="w-full border-4 border-black px-4 py-3 font-bold text-lg outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all shadow-[4px_4px_0px_#000]"
          [(ngModel)]="selectedEventId" (ngModelChange)="onEventChange($event)">
          <option value="">-- Choose Event --</option>
          @for (ev of events(); track ev.id) {
            <option [value]="ev.id">{{ ev.title }} ({{ ev.startDate | date:'mediumDate' }})</option>
          }
        </select>
      }
    </div>

    <!-- Participants List -->
    @if (selectedEventId) {
      <div class="mt-10">
        <h2 class="text-3xl font-black mb-6 bg-white inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000] -rotate-1">
          Participants ({{ participants().length }})
        </h2>

        @if (loadingParticipants()) {
          <p class="font-bold text-xl animate-pulse">Fetching participants...</p>
        } @else if (participants().length === 0) {
          <div class="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_#000]">
            <p class="text-2xl font-black text-neutral-500">No registrations found.</p>
          </div>
        } @else {
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (p of participants(); track p.id) {
              <div class="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] transition-transform hover:-translate-y-1 rounded-xl">
                <div class="mb-4">
                  <h3 class="text-xl font-black">{{ p.user.name }}</h3>
                  <p class="text-sm font-bold text-neutral-600">{{ p.user.email }}</p>
                </div>
                
                <div class="mb-4">
                  <span class="inline-block px-3 py-1 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
                    [class.bg-[#fde68a]]="p.status === 'pending'"
                    [class.bg-[#bbf7d0]]="p.status === 'approved'"
                    [class.bg-[#fecaca]]="p.status === 'rejected'"
                    [class.bg-[#9ca3af]]="p.status === 'CANCELLED'">
                    {{ p.status | uppercase }}
                  </span>
                </div>

                @if (p.status === 'pending' || p.status === 'approved' || p.status === 'rejected') {
                  <div class="flex gap-2 mt-4 pt-4 border-t-4 border-black">
                    @if (p.status !== 'approved') {
                      <button (click)="updateStatus(p.id, 'approved')"
                        class="flex-1 bg-[#bbf7d0] border-4 border-black font-black py-2 shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 text-xs">
                        APPROVE
                      </button>
                    }
                    @if (p.status !== 'rejected') {
                      <button (click)="updateStatus(p.id, 'rejected')"
                        class="flex-1 bg-[#f87171] border-4 border-black font-black py-2 shadow-[2px_2px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 text-xs text-white">
                        REJECT
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    }

  </div>
</div>
  `
})
export class CollegeAdminRegistrationsComponent implements OnInit {
  private eventService = inject(EventService);
  private regService = inject(RegistrationService);
  private snackbar = inject(MatSnackBar);

  events = signal<EventItem[]>([]);
  participants = signal<any[]>([]);
  
  loadingEvents = signal(true);
  loadingParticipants = signal(false);
  
  selectedEventId = '';

  ngOnInit() {
    this.eventService.getEvents().subscribe({
      next: (res) => {
        // College Admins see events in their college. They can pick any to manage registrations.
        this.events.set(res.events);
        this.loadingEvents.set(false);
      },
      error: () => this.loadingEvents.set(false)
    });
  }

  onEventChange(eventId: string) {
    if (!eventId) {
      this.participants.set([]);
      return;
    }
    this.loadParticipants(eventId);
  }

  loadParticipants(eventId: string) {
    this.loadingParticipants.set(true);
    this.regService.getEventParticipants(eventId).subscribe({
      next: (res) => {
        this.participants.set(res.participants);
        this.loadingParticipants.set(false);
      },
      error: (err) => {
        this.snackbar.open(err.error?.message || "Failed to load participants", "OK", { duration: 3000 });
        this.loadingParticipants.set(false);
      }
    });
  }

  updateStatus(registrationId: string, status: string) {
    this.regService.updateRegistrationStatus(registrationId, status).subscribe({
      next: () => {
        this.snackbar.open(`Registration ${status}`, "OK", { duration: 3000 });
        this.loadParticipants(this.selectedEventId);
      },
      error: (err) => {
        this.snackbar.open(err.error?.message || "Failed to update status", "OK", { duration: 3000 });
      }
    });
  }
}
