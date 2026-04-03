import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-college-admin-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen px-6 py-12 relative overflow-hidden bg-[#f8fafc]">
  <div class="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

  <div class="max-w-7xl mx-auto space-y-10 relative z-10">
    <div class="flex flex-col md:flex-row justify-between items-center gap-6">
      <h1 class="text-4xl md:text-5xl font-black uppercase bg-black text-white inline-block px-6 py-2 shadow-[8px_8px_0px_#f472b6] border-4 border-black">
        📋 MANAGE EVENTS
      </h1>
    </div>

    <!-- Filters -->
    <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px]">
        <label class="block font-black text-xs uppercase mb-1">Search Event</label>
        <input type="text" [(ngModel)]="searchQuery" placeholder="Event Name..." class="w-full border-4 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all">
      </div>
      <div class="w-full sm:w-auto">
        <label class="block font-black text-xs uppercase mb-1">Filter by Scope</label>
        <select [(ngModel)]="filterScope" class="w-full border-4 border-black px-4 py-2 font-bold focus:outline-none shadow-[4px_4px_0px_#000] bg-white">
          <option value="">All Scopes</option>
          <option value="COLLEGE">College (Internal)</option>
          <option value="GLOBAL">Global</option>
        </select>
      </div>
    </div>

    <!-- Event Cards Grid -->
    @if (loadingEvents()) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        @for (i of skeleton; track i) {
          <div class="h-64 bg-gray-200 animate-pulse border-4 border-black shadow-[8px_8px_0px_#000] rounded-xl"></div>
        }
      </div>
    } @else if (filteredEvents.length === 0) {
      <div class="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_#000]">
        <span class="text-6xl block mb-4">🏜️</span>
        <h2 class="text-2xl font-black">NO EVENTS FOUND</h2>
        <p class="font-bold text-neutral-600">Try adjusting your filters or search query.</p>
      </div>
    } @else {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:items-stretch">
        @for (ev of filteredEvents; track ev.id) {
          <div 
            (click)="manageEvent(ev.id)"
            class="group cursor-pointer bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between">
            
            <div>
              <div class="flex justify-between items-start mb-4">
                <span class="text-xs font-black px-2 py-1 border-2 border-black" [class.bg-[#fde68a]]="ev.scope === 'COLLEGE'" [class.bg-[#bbf7d0]]="ev.scope === 'GLOBAL'">
                  {{ ev.scope }}
                </span>
                <span class="text-xs font-black px-2 py-1 bg-black text-white">
                  {{ ev.category | uppercase }}
                </span>
              </div>
              
              <h3 class="text-xl font-black mb-2 group-hover:text-[#f472b6] transition-colors line-clamp-2">{{ ev.title }}</h3>
              <p class="text-xs font-bold text-neutral-600 mb-4">{{ ev.startDate | date:'mediumDate' }}</p>
            </div>

            <div class="border-t-4 border-black pt-4 mt-4 flex items-center justify-between">
              <span class="font-black text-sm uppercase">Manage →</span>
            </div>
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
  private snackbar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  events = signal<EventItem[]>([]);
  loadingEvents = signal(true);
  skeleton = Array(8);

  searchQuery = '';
  filterScope = '';
  collegeFilterId = '';

  get filteredEvents() {
    return this.events().filter(e => {
      const matchSearch = e.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchScope = this.filterScope ? e.scope === this.filterScope : true;
      const matchCollege = this.collegeFilterId ? e.collegeId === this.collegeFilterId : true;
      return matchSearch && matchScope && matchCollege;
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['collegeFilterId']) {
        this.collegeFilterId = params['collegeFilterId'];
      }
    });

    this.eventService.getEvents().subscribe({
      next: (res) => {
        this.events.set(res.events);
        this.loadingEvents.set(false);
      },
      error: (err) => {
        this.snackbar.open(err.error?.message || "Failed to load events", "OK", { duration: 3000 });
        this.loadingEvents.set(false);
      }
    });
  }

  manageEvent(eventId: string) {
    this.router.navigate(['/admin/manage-events', eventId]);
  }
}
