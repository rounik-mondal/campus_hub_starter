import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, startWith, catchError, of } from 'rxjs';

import { EventService } from '../../core/services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule],
  template: `
@let vm = (vm$ | async) ?? { loading: true, events: [] };

<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  <!-- Background noise -->
  <div class="absolute inset-0 pointer-events-none opacity-5"></div>

  <div class="max-w-7xl mx-auto space-y-10 relative z-10">

    <!-- Page Header (Brutalist Stamp) -->
    <div class="relative text-center">
      <h1 class="text-6xl md:text-7xl font-black tracking-tighter uppercase bg-black text-white inline-block px-8 py-4 rotate-[-1deg] shadow-[12px_12px_0px_#f472b6] border-4 border-black">
        ⚡ Events
      </h1>
      <p class="text-sm font-bold text-black bg-[#fde68a] inline-block px-4 py-1 mt-4 border-4 border-black shadow-[6px_6px_0px_#000] rotate-[0.5deg]">
        DISCOVER & JOIN
      </p>
    </div>

    <!-- Loading State (Brutalist Skeleton) -->
    @if (vm.loading) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        @for (i of skeleton; track $index) {
          <div
            class="h-56 rounded-3xl border-4 border-black bg-white shadow-[8px_8px_0px_#000] animate-pulse"
          ></div>
        }
      </div>
    }

    <!-- Empty State -->
    @if (!vm.loading && vm.events.length === 0) {
      <div class="rounded-[2.5rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">
        <div class="rounded-[2rem] border-4 border-black bg-white p-14 text-center shadow-[8px_8px_0px_#000]">
          <div class="space-y-4">
            <span class="text-7xl block">🎪</span>
            <h3 class="text-2xl font-black">NO EVENTS YET</h3>
            <p class="text-sm font-bold text-neutral-600">
              New events will appear here once they are created.
            </p>
          </div>
        </div>
      </div>
    }

    <!-- Events Grid (Brutalist Cards) -->
    @if (!vm.loading && vm.events.length > 0) {
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

        @for (event of vm.events; track event.id) {

          <div
            class="group rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0px_#000] transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:shadow-none flex flex-col hover:bg-[#fff4f2] hover:text-red">

            <!-- Top Row: Scope Badge + Category -->
            <div class="mb-4 flex items-center justify-between">

              <!-- Scope with emoji (fixed: using ternary instead of @if) -->
              <span
                class="flex items-center gap-1 rounded-xl border-4 border-black px-3 py-1 text-xs font-black shadow-[4px_4px_0px_#000]"
                [class.bg-[#fde68a]]="event.scope === 'COLLEGE'"
                [class.bg-[#bbf7d0]]="event.scope === 'GLOBAL'"
              >
                {{ event.scope === 'GLOBAL' ? '🌍' : '🏛️' }}
                {{ event.scope }}
              </span>

              <span class="text-xs font-black text-neutral-600 flex items-center gap-1">
                <span class="text-lg">🏷️</span> {{ event.category }}
              </span>

            </div>

            <!-- Title -->
            <h3 class="text-xl font-black leading-tight mb-2">
              {{ event.title }}
            </h3>

            <!-- Description -->
            <p class="text-sm font-medium text-neutral-700 line-clamp-2 mb-4 flex-grow">
              {{ event.description }}
            </p>

            <!-- Footer: College + Date -->
            <div class="mt-auto flex items-center justify-between border-t-4 border-black pt-4 text-xs font-black">

              <div class="flex items-center gap-1 truncate max-w-full">
                <span class="text-lg">🏫</span>
                <span class="truncate">{{ event.college?.name || 'Unknown' }}</span>
              </div>

            </div>

            <div class="mt-auto flex items-center justify-between text-xs font-black">

              <div
                class="flex items-center gap-1 rounded-lg border-4 border-black bg-[#e0f2fe] px-2 py-1 shadow-[3px_3px_0px_#000]">
                <span class="text-base">📅</span>
                {{ event.startDate | date: 'mediumDate' }}
              </div>
            </div>



          </div>

        }

      </div>
    }


  </div>
</div>
`,
})
export class EventListComponent {
  private eventService = inject(EventService);

  skeleton = Array(6);

  vm$ = this.eventService.getEvents().pipe(
    map((res) => ({
      loading: false,
      events: res.events as EventItem[],
    })),
    startWith({
      loading: true,
      events: [] as EventItem[],
    }),
    catchError(() =>
      of({
        loading: false,
        events: [] as EventItem[],
      })
    )
  );
}