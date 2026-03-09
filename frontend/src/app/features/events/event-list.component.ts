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
import { EventItem } from '../../models/event.model';

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

<button
(click)="openRegister(event)"
class="border-4 border-black bg-[#bbf7d0]
px-4 py-2 font-black shadow-[4px_4px_0px_#000]
hover:bg-green-200
hover:translate-x-1 hover:translate-y-1
hover:shadow-none
active:scale-95
transition-all">

Register

</button>

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

<h2 class="text-2xl font-black">Register Event</h2>

<p class="text-sm font-bold">{{ selectedEvent?.title }}</p>

<input
type="text"
placeholder="Full Name"
[(ngModel)]="registration.name"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]" />

<input
type="email"
placeholder="Email"
[(ngModel)]="registration.email"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]" />

<input
type="text"
placeholder="College"
[(ngModel)]="registration.college"
class="w-full border-4 border-black px-3 py-2 font-bold
shadow-[2px_2px_0px_#000]" />

<div class="flex justify-between">

<button
(click)="submitRegistration()"
class="border-4 border-black bg-[#bbf7d0]
px-4 py-2 font-black
shadow-[4px_4px_0px_#000]
hover:translate-x-1 hover:translate-y-1 hover:shadow-none">

Submit

</button>

<button
(click)="closeRegister()"
class="border-4 border-black bg-[#f87171]
px-4 py-2 font-black
shadow-[4px_4px_0px_#000]
hover:translate-x-1 hover:translate-y-1 hover:shadow-none">

Cancel

</button>

</div>

</div>

</div>

}

`,
})
export class EventListComponent {

/* your entire logic remains exactly the same */

private eventService = inject(EventService);

skeleton = Array(6);
pageSize = 6;

selectedDate = '';
selectedType = '';
selectedCollege = '';
selectedCategory = '';
searchQuery = '';

showFilters = false;

showRegisterModal = false;
selectedEvent: EventItem | null = null;

registration = { name: '', email: '', college: '' };

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
this.selectedEvent = event;
this.showRegisterModal = true;
}

closeRegister() {
this.showRegisterModal = false;
this.registration = { name: '', email: '', college: '' };
}

submitRegistration() {
console.log({ eventId: this.selectedEvent?.id, ...this.registration });
this.closeRegister();
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