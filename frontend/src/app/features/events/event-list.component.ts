import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  map,
  startWith,
  catchError,
  of,
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

import { EventService } from '../../core/services/event.service';
import { RegistrationService } from '../../core/services/registration.service';
import { PaymentService } from '../../core/services/payment.service';
import { TokenService } from '../../core/services/token.service';
import { EventItem } from '../../models/event.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

@let vm = (vm$ | async) ?? {
loading: true,
events: [],
filteredCount: 0,
totalCount: 0,
currentPage: 1,
totalPages: 1,
pageSize: 6
};

<div class="min-h-screen px-6 py-12 relative overflow-hidden">

<!-- subtle pattern background -->
<div class="absolute inset-0 pointer-events-none opacity-10
bg-[radial-gradient(#000_1px,transparent_1px)]
[background-size:22px_22px]"></div>

<div class="max-w-7xl mx-auto space-y-12 relative z-10">

<!-- HEADER -->
<div class="text-center space-y-4">

<h1
class="text-5xl md:text-7xl font-black tracking-tight uppercase
bg-black text-white inline-block px-8 py-4
rotate-[-1deg] shadow-[12px_12px_0px_#f472b6]
border-4 border-black">
⚡ Events
</h1>

<div class="flex justify-center">
<p
class="text-xs md:text-sm font-black text-black
bg-[#fde68a] px-4 py-1
border-4 border-black
shadow-[6px_6px_0px_#000]
rotate-[1deg]">
DISCOVER • JOIN • EXPLORE
</p>
</div>

</div>

<!-- SEARCH + FILTER -->
<div class="flex flex-col items-center gap-4">

<div class="flex w-full max-w-lg items-center gap-2">

<div class="relative flex-1">
<input
type="text"
placeholder="Search events..."
[ngModel]="searchQuery"
(ngModelChange)="onSearchChange($event)"
class="w-full border-4 border-black px-4 py-2 pr-10 font-bold
bg-white shadow-[4px_4px_0px_#000]
focus:bg-yellow-50 focus:translate-x-1 focus:translate-y-1
focus:shadow-none transition-all outline-none"
/>

@if (searchQuery) {
<button
(click)="clearFilter('search')"
class="absolute right-3 top-1/2 -translate-y-1/2 font-black">
✕
</button>
}

</div>

<button
(click)="toggleFilters()"
class="border-4 border-black bg-[#fde68a] px-5 py-2 font-black
shadow-[4px_4px_0px_#000]
hover:bg-yellow-300
hover:translate-x-1 hover:translate-y-1
hover:shadow-none transition-all whitespace-nowrap">
⚙ {{ showFilters ? 'Hide' : 'Filters' }}
</button>

</div>

<!-- ACTIVE FILTERS -->
<div class="flex flex-wrap justify-center gap-2">

@if (activeFilterCount > 0) {
<span
class="text-sm font-bold bg-black text-white
px-3 py-1 border-4 border-black
shadow-[2px_2px_0px_#000]">
{{ vm.filteredCount }} / {{ vm.totalCount }} events
</span>
}

@for (filter of activeFilters; track filter.key) {
<div
class="flex items-center gap-2
border-4 border-black
bg-[#e0f2fe]
px-3 py-1 font-bold text-sm
shadow-[3px_3px_0px_#000]">

<span>{{ filter.icon }}</span>
<span>{{ filter.label }}</span>

<button
(click)="clearFilter(filter.key)"
class="text-lg hover:text-red-600">
×
</button>

</div>
}

@if (activeFilterCount > 0) {
<button
(click)="resetFilters()"
class="border-4 border-black bg-[#f87171] text-white
px-3 py-1 font-bold text-sm
shadow-[3px_3px_0px_#000]
hover:translate-x-1 hover:translate-y-1
hover:shadow-none transition-all">
Clear All
</button>
}

</div>

</div>

<!-- FILTER PANEL -->
@if (showFilters) {

<div
class="border-4 border-black bg-white
p-6 rounded-xl
shadow-[8px_8px_0px_#000]">

<div class="grid gap-6 md:grid-cols-4">

<div class="space-y-2">
<label class="text-xs font-black uppercase">📅 Date</label>
<input
type="date"
[ngModel]="selectedDate"
(ngModelChange)="onFilterChange('date', $event)"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]
focus:translate-x-1 focus:translate-y-1 focus:shadow-none
transition-all outline-none"
/>
</div>

<div class="space-y-2">
<label class="text-xs font-black uppercase">🌍 Type</label>
<select
[ngModel]="selectedType"
(ngModelChange)="onFilterChange('type', $event)"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]
focus:translate-x-1 focus:translate-y-1 focus:shadow-none
transition-all outline-none">
<option value="">All</option>
<option value="COLLEGE">🏛️ College</option>
<option value="GLOBAL">🌍 Global</option>
</select>
</div>

<div class="space-y-2">
<label class="text-xs font-black uppercase">🏫 College</label>
<input
type="text"
placeholder="e.g. Tech U"
[ngModel]="selectedCollege"
(ngModelChange)="onFilterChange('college', $event)"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]
focus:translate-x-1 focus:translate-y-1 focus:shadow-none
transition-all outline-none"
/>
</div>

<div class="space-y-2">
<label class="text-xs font-black uppercase">🏷 Category</label>
<input
type="text"
placeholder="e.g. Tech"
[ngModel]="selectedCategory"
(ngModelChange)="onFilterChange('category', $event)"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]
focus:translate-x-1 focus:translate-y-1 focus:shadow-none
transition-all outline-none"
/>
</div>

</div>
</div>

}

<!-- LOADING -->
@if (vm.loading) {

<div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">

@for (i of skeleton; track $index) {

<div
class="h-56 rounded-3xl border-4 border-black
bg-white shadow-[8px_8px_0px_#000]
animate-pulse">
</div>

}

</div>

}

<!-- EMPTY -->
@if (!vm.loading && vm.filteredCount === 0) {

<div
class="rounded-[2.5rem] border-4 border-black
bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">

<div
class="rounded-[2rem] border-4 border-black bg-white
p-14 text-center shadow-[8px_8px_0px_#000]">

<span class="text-7xl block animate-bounce">🎪</span>

<h3 class="text-2xl font-black">NO EVENTS FOUND</h3>

<p class="text-sm font-bold mt-3 text-neutral-600">
Try adjusting filters or search keywords
</p>

</div>

</div>

}

<!-- EVENTS GRID -->
@if (!vm.loading && vm.events.length > 0) {

<div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">

@for (event of vm.events; track event.id) {

<div
class="group rounded-3xl border-4 border-black
bg-white p-6 shadow-[10px_10px_0px_#000]
transition-all duration-200
hover:translate-x-1 hover:translate-y-1 hover:shadow-none
hover:bg-[#fff8f6] flex flex-col">

<div class="mb-4 flex justify-between items-center">

<span
class="flex items-center gap-1 rounded-xl
border-4 border-black px-3 py-1
text-xs font-black shadow-[4px_4px_0px_#000]"
[class.bg-[#fde68a]]="event.scope === 'COLLEGE'"
[class.bg-[#bbf7d0]]="event.scope === 'GLOBAL'">

{{ event.scope === 'GLOBAL' ? '🌍' : '🏛️' }}
{{ event.scope }}

</span>

<span class="text-xs font-black text-neutral-600">
🏷 {{ event.category }}
</span>

</div>

<h3 class="text-xl font-black mb-2 group-hover:underline">
{{ event.title }}
</h3>

<p class="text-sm text-neutral-700 line-clamp-3 mb-4 flex-grow">
{{ event.description }}
</p>

<div class="mt-auto border-t-4 border-black pt-4 text-xs font-black">
🏫 {{ event.college?.name || 'Unknown' }}
</div>

<div class="mt-4 flex flex-wrap gap-2 text-xs font-black">
  @if (event.isPaid) {
    <span class="rounded-lg border-2 border-black bg-[#f472b6] px-2 py-1 shadow-[2px_2px_0px_#000]">
      💰 \${{ event.ticketPrice }}
    </span>
  } @else {
    <span class="rounded-lg border-2 border-black bg-[#bbf7d0] px-2 py-1 shadow-[2px_2px_0px_#000]">
      🆓 FREE
    </span>
  }

  @if (event.isTeamEvent) {
    <span class="rounded-lg border-2 border-black bg-[#4ade80] px-2 py-1 shadow-[2px_2px_0px_#000]">
      🤝 Team (Max {{ event.maxTeamSize }})
    </span>
  }

  <span class="rounded-lg border-2 border-black bg-[#fde68a] px-2 py-1 shadow-[2px_2px_0px_#000]">
    🪑 {{ event.maxSeats - (event._count?.registrations || 0) }} / {{ event.maxSeats }} Seats
  </span>
</div>

<div class="mt-3 flex justify-center">

<div
class="flex items-center gap-2 rounded-lg
border-4 border-black bg-[#e0f2fe]
px-3 py-1 shadow-[3px_3px_0px_#000]
text-sm font-bold">

📅 {{ event.startDate | date:'mediumDate' }}

</div>

</div>

<div class="mt-3 flex justify-center">

@if (userRole() !== 'college_admin' && userRole() !== 'super_admin') {

  @if (event.registrations?.length && (event.registrations![0].status === 'pending' || event.registrations![0].status === 'approved')) {
    
    <button
    (click)="cancelRegistration(event)"
    class="border-4 border-black bg-[#f87171]
    px-4 py-2 font-black shadow-[4px_4px_0px_#000]
    hover:bg-red-400 hover:translate-x-1 hover:translate-y-1 hover:shadow-none
    active:scale-95 transition-all">
      Cancel Registration
    </button>

  } @else if (event.registrations?.length && event.registrations![0].status === 'CANCELLED') {

    <span class="border-4 border-black bg-gray-300 px-4 py-2 font-black shadow-[4px_4px_0px_#000] opacity-70 cursor-not-allowed">
      Registration Cancelled
    </span>

  } @else {

    <button
    (click)="openRegister(event)"
    [disabled]="(event.maxSeats - (event._count?.registrations || 0)) <= 0"
    class="border-4 border-black bg-[#bbf7d0]
    px-4 py-2 font-black shadow-[4px_4px_0px_#000]
    hover:bg-green-200
    hover:translate-x-1 hover:translate-y-1
    hover:shadow-none
    active:scale-95
    transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed">
    {{ (event.maxSeats - (event._count?.registrations || 0)) <= 0 ? 'SOLD OUT' : 'Register' }}
    </button>
    
  }

}

</div>

</div>

}

</div>

<!-- PAGINATION -->

<div class="flex justify-center items-center gap-4 mt-10">

<button
(click)="changePage(vm.currentPage - 1)"
[disabled]="vm.currentPage === 1"
class="border-4 border-black bg-white px-4 py-2 font-black
shadow-[4px_4px_0px_#000]
hover:bg-gray-100
hover:translate-x-1 hover:translate-y-1 hover:shadow-none
disabled:opacity-40 disabled:cursor-not-allowed">

← Prev

</button>

<div
class="border-4 border-black px-4 py-2
bg-yellow-200 font-black
shadow-[4px_4px_0px_#000]">

Page {{ vm.currentPage }} / {{ vm.totalPages }}

</div>

<button
(click)="changePage(vm.currentPage + 1)"
[disabled]="vm.currentPage === vm.totalPages"
class="border-4 border-black bg-white px-4 py-2 font-black
shadow-[4px_4px_0px_#000]
hover:bg-gray-100
hover:translate-x-1 hover:translate-y-1 hover:shadow-none
disabled:opacity-40 disabled:cursor-not-allowed">

Next →

</button>

</div>

}

</div>
</div>

<!-- MODAL -->

@if (showRegisterModal) {

<div
class="fixed inset-0 bg-black/60 backdrop-blur-sm
flex items-center justify-center z-50">

<div
class="bg-white border-4 border-black
p-8 w-[420px] rounded-xl
shadow-[10px_10px_0px_#000] space-y-4">

@if (registerStep === 'initial') {
  <h2 class="text-2xl font-black">Team Registration</h2>
  <p class="text-sm font-bold">{{ selectedEvent?.title }}</p>
  <div class="bg-[#e0f2fe] border-4 border-black p-4 mb-4 font-black shadow-[4px_4px_0px_#000] text-sm mt-4">
    Do you want to add teammates to your team now?
  </div>
  <div class="flex flex-col gap-3 mt-4">
    <button (click)="setupTeamAndGoToInvite()" [disabled]="isCreatingTeam" class="border-4 border-black bg-[#4ade80] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50">
      {{ isCreatingTeam ? 'Setting up...' : 'Yes, Add Teammates' }}
    </button>
    <button (click)="goToSummary()" [disabled]="isCreatingTeam" class="border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
      No, Skip to Summary
    </button>
  </div>
} @else if (registerStep === 'invite') {
  <h2 class="text-2xl font-black mb-2">Invite Teammates</h2>
  <div class="flex gap-2">
     <input type="email" [(ngModel)]="inviteEmail" placeholder="Teammate Email" class="flex-1 border-4 border-black px-3 py-2 font-bold shadow-[2px_2px_0px_#000]">
     <button (click)="sendModalInvite()" [disabled]="isSendingInvite" class="border-4 border-black bg-[#fde68a] px-4 py-2 font-black shadow-[2px_2px_0px_#000] disabled:opacity-50">
       Send
     </button>
  </div>
  @if(sessionInvites.length > 0) {
     <div class="mt-4 border-t-4 border-black pt-4">
       <p class="text-xs font-black uppercase text-neutral-500 mb-2">Invited this session:</p>
       @for(inv of sessionInvites; track $index) {
         <p class="text-sm font-bold bg-[#e0f2fe] border-4 border-black px-2 py-1 mb-1 shadow-[2px_2px_0px_#000]">{{inv}}</p>
       }
     </div>
  }
  <button (click)="goToSummary()" class="w-full mt-6 border-4 border-black bg-black text-white px-4 py-2 font-black shadow-[4px_4px_0px_#f472b6] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
    Continue to Summary
  </button>
} @else if (registerStep === 'summary') {
  <h2 class="text-2xl font-black">Registration Summary</h2>
  <div class="border-4 border-black p-4 bg-[#f8fafc] shadow-[4px_4px_0px_#000] mt-4 space-y-2">
    <p class="font-black text-lg">{{ selectedEvent?.title }}</p>
    <p class="text-sm font-bold">📅 {{ selectedEvent?.startDate | date:'shortDate' }}</p>
    <p class="text-sm font-bold">🪑 Remaining Event Seats: {{ selectedEvent?.maxSeats || 0 - (selectedEvent?._count?.registrations || 0) }}</p>
    @if(selectedEvent?.isTeamEvent) {
      <p class="text-sm font-bold">🤝 Teammates added: {{ sessionInvites.length }}</p>
    }
    @if(selectedEvent?.isPaid) {
      <p class="font-black text-[#ec4899] mt-2 bg-yellow-200 border-2 border-black px-2 py-1 inline-block shadow-[2px_2px_0px_#000]">💰 Ticket: \${{ selectedEvent?.ticketPrice }}</p>
    } @else {
      <p class="font-black text-[#16a34a] mt-2 bg-[#bbf7d0] border-2 border-black px-2 py-1 inline-block shadow-[2px_2px_0px_#000]">🆓 FREE TICKET</p>
    }
  </div>

  <div class="flex flex-col gap-3 mt-6">
    <button (click)="submitPaymentOrRegister()" [disabled]="processingPayment" class="border-4 border-black bg-[#f472b6] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50">
      {{ processingPayment ? 'Processing...' : (selectedEvent?.isPaid ? 'Confirm Payment' : 'Confirm Registration') }}
    </button>
    <button (click)="closeRegister()" [disabled]="processingPayment" class="border-4 border-black bg-white px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
      Cancel
    </button>
  </div>
} @else if (registerStep === 'success') {
  <div class="text-center space-y-4">
    <div class="bg-[#bbf7d0] border-4 border-black p-4 inline-block shadow-[4px_4px_0px_#000] mb-4">
      <h3 class="font-black text-xl">SUCCESS!</h3>
      <p class="text-xs font-bold mt-2">Registration Confirmed</p>
    </div>
    
    <div class="border-4 border-black bg-white p-4">
      <div class="w-full h-32 bg-gray-200 border-4 border-black flex items-center justify-center font-black">
        QR CODE [{{ registrationSuccessData?.qrPayload?.substring(0, 15) }}...]
      </div>
      <p class="text-xs font-black mt-2">Show this at entry</p>
    </div>

    <button (click)="downloadICS()" class="w-full border-4 border-black bg-[#fde68a] px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none mb-2">
      📅 Download Calendar Form
    </button>

    <button (click)="closeRegister()" class="w-full border-4 border-black bg-black text-white px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
       DONE
    </button>
  </div>
}

</div>

</div>

}

<!-- LOGIN PROMPT MODAL -->
@if (promptLoginModal) {
<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
  <div class="bg-white border-4 border-black p-8 w-[400px] rounded-xl shadow-[10px_10px_0px_#000] text-center">
    <h2 class="text-3xl font-black mb-4 flex justify-center">🔐</h2>
    <h2 class="text-xl font-black mb-4">Please login to register for this event</h2>
    <div class="flex justify-center gap-4 mt-6">
      <button (click)="goToLogin()" class="border-4 border-black bg-[#fde68a] px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">Go to Login</button>
      <button (click)="promptLoginModal = false" class="border-4 border-black bg-white px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">Cancel</button>
    </div>
  </div>
</div>
}

`,
})
export class EventListComponent {

/* your entire logic remains exactly the same */

private eventService = inject(EventService);
private regService = inject(RegistrationService);
private paymentService = inject(PaymentService);
private tokenService = inject(TokenService);
private snackbar = inject(MatSnackBar);
private router = inject(Router);
private http = inject(HttpClient);

isLoggedIn = this.tokenService.isLoggedIn;
userRole = () => {
  const user = this.tokenService.getUser();
  return user ? user.role : null;
};

skeleton = Array(6);
pageSize = 6;

selectedDate = '';
selectedType = '';
selectedCollege = '';
selectedCategory = '';
searchQuery = '';

showFilters = false;

promptLoginModal = false;
showRegisterModal = false;
selectedEvent: EventItem | null = null;
registrationSuccessData: any = null;
processingPayment = false;

registerStep: 'initial' | 'invite' | 'summary' | 'success' = 'initial';
createdTeamId: string | null = null;
inviteEmail = '';
sessionInvites: string[] = [];
isCreatingTeam = false;
isSendingInvite = false;

private searchSubject = new BehaviorSubject<string>('');
private filterTrigger$ = new BehaviorSubject<void>(undefined);
private page$ = new BehaviorSubject<number>(1);

activeFilters: { key: string; label: string; icon: string }[] = [];
activeFilterCount = 0;

constructor() {
this.searchSubject.pipe(
debounceTime(300),
distinctUntilChanged()
).subscribe(query => {
this.searchQuery = query;
this.filterTrigger$.next();
this.page$.next(1);
});
}

onSearchChange(query: string) {
this.searchSubject.next(query);
}

onFilterChange(type: string, value: any) {
switch (type) {
case 'date': this.selectedDate = value; break;
case 'type': this.selectedType = value; break;
case 'college': this.selectedCollege = value; break;
case 'category': this.selectedCategory = value; break;
}

this.filterTrigger$.next();
this.page$.next(1);
}

clearFilter(key: string) {
switch (key) {
case 'date': this.selectedDate = ''; break;
case 'type': this.selectedType = ''; break;
case 'college': this.selectedCollege = ''; break;
case 'category': this.selectedCategory = ''; break;
case 'search':
this.searchQuery = '';
this.searchSubject.next('');
break;
}

this.filterTrigger$.next();
this.page$.next(1);
}

resetFilters() {
this.selectedDate = '';
this.selectedType = '';
this.selectedCollege = '';
this.selectedCategory = '';
this.searchQuery = '';

this.searchSubject.next('');

this.filterTrigger$.next();
this.page$.next(1);
}

toggleFilters() {
this.showFilters = !this.showFilters;
}

changePage(page: number) {
if (page >= 1) {
this.page$.next(page);
}
}

openRegister(event: EventItem) {
  if (!this.isLoggedIn()) {
    this.promptLoginModal = true;
    return;
  }
  this.selectedEvent = event;
  this.registrationSuccessData = null;
  this.processingPayment = false;
  this.createdTeamId = null;
  this.inviteEmail = '';
  this.sessionInvites = [];
  
  if (event.isTeamEvent) {
     this.registerStep = 'initial';
  } else {
     this.registerStep = 'summary';
  }
  this.showRegisterModal = true;
}

setupTeamAndGoToInvite() {
  if (!this.selectedEvent) return;
  this.isCreatingTeam = true;
  
  this.http.get<any>(`${environment.apiUrl}/teams/event/${this.selectedEvent.id}`).subscribe({
     next: (res) => {
       if (res && res.team) {
          this.createdTeamId = res.team.id;
          this.isCreatingTeam = false;
          this.registerStep = 'invite';
       } else {
          this.http.post<any>(`${environment.apiUrl}/teams`, { eventId: this.selectedEvent!.id }).subscribe({
             next: (newRes) => {
                this.createdTeamId = newRes.team.id;
                this.isCreatingTeam = false;
                this.registerStep = 'invite';
             },
             error: (err) => {
                this.isCreatingTeam = false;
                this.snackbar.open(err.error?.message || "Error creating team", "OK", { duration: 3000 });
             }
          });
       }
     },
     error: (err) => {
       this.isCreatingTeam = false;
       this.snackbar.open("Failed to load team data", "OK");
     }
  });
}

sendModalInvite() {
  if (!this.inviteEmail || !this.createdTeamId) return;
  this.isSendingInvite = true;
  this.http.post<any>(`${environment.apiUrl}/teams/invite`, { teamId: this.createdTeamId, inviteeEmail: this.inviteEmail }).subscribe({
     next: () => {
       this.snackbar.open("Invited!", "OK", { duration: 2000 });
       this.sessionInvites.push(this.inviteEmail);
       this.inviteEmail = '';
       this.isSendingInvite = false;
     },
     error: (err) => {
       this.isSendingInvite = false;
       this.snackbar.open(err.error?.message || "Failed to invite", "OK", { duration: 3000 });
     }
  });
}

goToSummary() {
  this.registerStep = 'summary';
}

submitPaymentOrRegister() {
   if (this.selectedEvent?.isPaid) {
      this.submitPaymentAndRegister();
   } else {
      this.submitRegistration();
   }
}

cancelRegistration(event: EventItem) {
  if (confirm("Are you sure you want to cancel your registration for this event?")) {
    this.regService.cancelRegistration(event.id).subscribe({
      next: () => {
        this.snackbar.open("Registration Cancelled", "OK", { duration: 3000 });
        this.filterTrigger$.next();
      },
      error: (err) => this.snackbar.open(err.error?.message || "Failed to cancel", "OK", { duration: 3000 })
    });
  }
}

goToLogin() {
  this.router.navigate(['/login']);
}

closeRegister() {
this.showRegisterModal = false;
this.registrationSuccessData = null;
this.processingPayment = false;
}

submitRegistration() {
  if (!this.selectedEvent) return;
  this.processingPayment = true;
  this.regService.registerForEvent(this.selectedEvent.id).subscribe({
    next: (res) => {
      this.processingPayment = false;
      this.registrationSuccessData = {
        qrPayload: res.qrPayload,
        icsData: res.icsData
      };
      this.registerStep = 'success';
      this.snackbar.open("✅ Registered successfully!", "OK", { duration: 3000 });
      this.filterTrigger$.next();
    },
    error: (err) => {
      this.processingPayment = false;
      this.snackbar.open(err.error?.message || "Registration failed", "OK", { duration: 3000 });
    }
  });
}

submitPaymentAndRegister() {
  if (!this.selectedEvent) return;
  
  this.processingPayment = true;
  this.paymentService.simulatePayment(this.selectedEvent.id, this.selectedEvent.ticketPrice).subscribe({
    next: (res) => {
      this.snackbar.open("✅ Payment successful! Registering...", "OK", { duration: 2000 });
      // On payment success, proceed to register
      this.submitRegistration();
    },
    error: (err) => {
      this.processingPayment = false;
      this.snackbar.open(err.error?.message || "Payment failed", "OK", { duration: 3000 });
    }
  });
}

downloadICS() {
  if (!this.registrationSuccessData?.icsData) return;
  const blob = new Blob([this.registrationSuccessData.icsData], { type: 'text/calendar' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'event.ics';
  a.click();
  window.URL.revokeObjectURL(url);
}

private buildActiveFilters() {
const filters = [];

if (this.selectedDate)
filters.push({ key: 'date', label: `📅 ${new Date(this.selectedDate).toLocaleDateString()}`, icon: '📅' });

if (this.selectedType)
filters.push({
key: 'type',
label: this.selectedType === 'COLLEGE' ? '🏛️ College' : '🌍 Global',
icon: this.selectedType === 'COLLEGE' ? '🏛️' : '🌍'
});

if (this.selectedCollege)
filters.push({ key: 'college', label: `🏫 ${this.selectedCollege}`, icon: '🏫' });

if (this.selectedCategory)
filters.push({ key: 'category', label: `🏷️ ${this.selectedCategory}`, icon: '🏷️' });

if (this.searchQuery)
filters.push({ key: 'search', label: `🔍 ${this.searchQuery}`, icon: '🔍' });

this.activeFilters = filters;
this.activeFilterCount = filters.length;
}

vm$ = combineLatest([
this.eventService.getEvents(),
this.filterTrigger$.pipe(startWith(undefined)),
this.page$
]).pipe(
map(([res, _, currentPage]) => {

let events = res.events as EventItem[];
const totalCount = events.length;

events = events.filter(event => {

const matchDate = !this.selectedDate ||
new Date(event.startDate).toDateString() ===
new Date(this.selectedDate).toDateString();

const matchType =
!this.selectedType ||
event.scope === this.selectedType;

const matchCollege =
!this.selectedCollege ||
event.college?.name?.toLowerCase().includes(this.selectedCollege.toLowerCase());

const matchCategory =
!this.selectedCategory ||
event.category?.toLowerCase().includes(this.selectedCategory.toLowerCase());

const matchSearch =
!this.searchQuery ||
event.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
event.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
event.category?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
event.college?.name?.toLowerCase().includes(this.searchQuery.toLowerCase());

return matchDate && matchType && matchCollege && matchCategory && matchSearch;

});

this.buildActiveFilters();

const filteredCount = events.length;

const totalPages = Math.ceil(filteredCount / this.pageSize);

const start = (currentPage - 1) * this.pageSize;

const paginatedEvents = events.slice(start, start + this.pageSize);

return {
loading: false,
events: paginatedEvents,
filteredCount,
totalCount,
currentPage,
totalPages,
pageSize: this.pageSize
};

}),
startWith({
loading: true,
events: [],
filteredCount: 0,
totalCount: 0,
currentPage: 1,
totalPages: 1,
pageSize: this.pageSize
}),
catchError(() =>
of({
loading: false,
events: [],
filteredCount: 0,
totalCount: 0,
currentPage: 1,
totalPages: 1,
pageSize: this.pageSize
})
)
);

}