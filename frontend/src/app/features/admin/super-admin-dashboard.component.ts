import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CollegeService } from '../../core/services/college.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AdminLogService } from '../../core/services/admin-log.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
<div class="min-h-screen bg-[#f8fafc] px-6 py-12 relative overflow-hidden font-mono">
  
  <div class="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

  <div class="max-w-7xl mx-auto relative z-10 space-y-8">

    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="relative">
        <h1 class="text-4xl md:text-5xl font-black uppercase bg-black text-white inline-block px-6 py-2 shadow-[8px_8px_0px_#f472b6] border-4 border-black">
          ⚡ PLATFORM COMMAND
        </h1>
      </div>
      
      <div class="flex gap-4">
          <button (click)="activeTab = 'colleges'" [class.bg-[#fde68a]]="activeTab === 'colleges'" [class.bg-white]="activeTab !== 'colleges'" class="border-4 border-black px-6 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
              Colleges & Admins
          </button>
          <button (click)="activeTab = 'logs'" [class.bg-[#fde68a]]="activeTab === 'logs'" [class.bg-white]="activeTab !== 'logs'" class="border-4 border-black px-6 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
              System Logs
          </button>
      </div>
    </div>

    <!-- Persistent Analytics Row -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <div class="stat-card bg-[#f472b6]">
            <div class="flex justify-between items-start"><span class="text-3xl">🏛️</span><span class="text-3xl font-black">{{ analytics()?.totalColleges || 0 }}</span></div>
            <p class="font-black mt-2 border-t-4 border-black pt-1 block truncate">TOTAL COLLEGES</p>
        </div>
        <div class="stat-card bg-[#4ade80]">
            <div class="flex justify-between items-start"><span class="text-3xl">👥</span><span class="text-3xl font-black">{{ analytics()?.totalAdmins || 0 }}</span></div>
            <p class="font-black mt-2 border-t-4 border-black pt-1 block truncate">COLLEGE ADMINS</p>
        </div>
        <div class="stat-card bg-[#a78bfa]">
            <div class="flex justify-between items-start"><span class="text-3xl">🎉</span><span class="text-3xl font-black">{{ analytics()?.totalEvents || 0 }}</span></div>
            <p class="font-black mt-2 border-t-4 border-black pt-1 block truncate">TOTAL EVENTS</p>
        </div>
        <div class="stat-card bg-[#60a5fa]">
            <div class="flex justify-between items-start"><span class="text-3xl">💰</span><span class="text-3xl font-black">\${{ analytics()?.totalRevenue || 0 }}</span></div>
            <p class="font-black mt-2 border-t-4 border-black pt-1 block truncate">LIFETIME REVENUE</p>
        </div>
    </div>

    @if (activeTab === 'colleges') {
    <!-- Colleges Management Tab -->
    <div class="space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row justify-between gap-4 items-end bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
            <div class="w-full md:w-1/2">
                <label class="block font-black text-xs uppercase mb-1">Search College</label>
                <input type="text" [(ngModel)]="searchQuery" placeholder="Filter by name..." class="w-full border-4 border-black px-4 py-2 font-bold focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 shadow-[4px_4px_0px_#000] focus:shadow-none transition-all">
            </div>
            <div class="flex gap-4">
                <a routerLink="/admin/create-college" class="border-4 border-black bg-[#bbf7d0] px-6 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase whitespace-nowrap">
                    + College
                </a>
                <a routerLink="/admin/create-college-admin" class="border-4 border-black bg-[#fde68a] px-6 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase whitespace-nowrap">
                    + Admin
                </a>
            </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (c of filteredColleges; track c.id) {
            <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex flex-col justify-between hover:-translate-y-1 transition-transform">
                <div>
                    <div class="flex justify-between items-end mb-4 border-b-4 border-black pb-2">
                        <h2 class="text-2xl font-black line-clamp-1" [title]="c.name">{{ c.name }}</h2>
                    </div>

                    <div class="flex items-center justify-between mb-4 bg-neutral-100 p-2 border-2 border-black">
                        <span class="font-black text-xs uppercase">Platform Events:</span>
                        <span class="font-black text-lg bg-black text-white px-2 leading-none py-1">{{ c._count?.events || 0 }}</span>
                    </div>

                    <div class="space-y-2 mb-6">
                        <p class="font-black text-xs uppercase text-neutral-500">Assigned Admins ({{ c.users?.length || 0 }})</p>
                        @for (admin of c.users; track admin.id) {
                            <div class="bg-[#f8fafc] border-2 border-dashed border-black p-2 flex justify-between items-center group">
                                <div class="truncate mr-2">
                                    <p class="font-black text-[0.65rem] uppercase block line-clamp-1">{{ admin.name }}</p>
                                    <p class="text-[0.6rem] font-bold text-neutral-600 truncate">{{ admin.email }}</p>
                                </div>
                                <button (click)="openRevokeModal(c.id, admin.id, admin.name)" class="opacity-0 group-hover:opacity-100 bg-[#f87171] text-white border-2 border-black px-2 py-0.5 text-[0.6rem] font-black hover:bg-black transition-all">
                                    REVOKE
                                </button>
                            </div>
                        } @empty {
                            <p class="text-xs font-bold text-neutral-500 italic">No Admins configured.</p>
                        }
                    </div>
                </div>

                <button (click)="viewCollegeEvents(c.id)" class="w-full border-4 border-black bg-black text-white px-4 py-2 font-black shadow-[4px_4px_0px_#f472b6] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
                    View Events →
                </button>
            </div>
            } @empty {
                <div class="col-span-full border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0px_#000]">
                    <p class="font-black text-xl text-neutral-500">NO COLLEGES FOUND.</p>
                </div>
            }
        </div>
    </div>
    }

    @if (activeTab === 'logs') {
    <!-- System Logs Tab -->
    <div class="space-y-6 animate-fade-in">
        <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] flex gap-4 items-end flex-wrap">
            <div class="flex-1">
                <label class="block font-black uppercase text-xs mb-1">Filter by College</label>
                <select [(ngModel)]="logFilterCollege" class="w-full border-4 border-black p-2 font-bold focus:outline-none shadow-[2px_2px_0px_#000]">
                    <option value="">ALL COLLEGES</option>
                    @for (c of colleges(); track c.id) {
                        <option [value]="c.id">{{ c.name }}</option>
                    }
                </select>
            </div>
            <div>
                <button (click)="fetchLogs()" class="border-4 border-black bg-[#a78bfa] text-white px-8 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                    APPLY FILTER
                </button>
            </div>
        </div>

        <div class="bg-white border-4 border-black shadow-[8px_8px_0px_#000]">
            @if (logs().length === 0) {
                <div class="p-8 text-center font-black text-xl text-neutral-500">NO LOGS BUILT</div>
            } @else {
                <div class="max-h-[600px] overflow-y-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-black text-white sticky top-0">
                            <tr>
                                <th class="p-4 font-black uppercase border-r-4 border-b-4 border-black">Timestamp</th>
                                <th class="p-4 font-black uppercase border-r-4 border-b-4 border-black">Admin</th>
                                <th class="p-4 font-black uppercase border-r-4 border-b-4 border-black">College</th>
                                <th class="p-4 font-black uppercase border-b-4 border-black">Context Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (log of logs(); track log.id) {
                            <tr class="border-b-4 border-black last:border-b-0 hover:bg-[#fde68a] transition-colors">
                                <td class="p-4 border-r-4 border-black font-bold whitespace-nowrap">{{ log.timestamp | date:'short' }}</td>
                                <td class="p-4 border-r-4 border-black">
                                    <span class="font-black block">{{ log.user?.name }}</span>
                                    <span class="text-[0.65rem] text-neutral-500 font-bold">{{ log.user?.email }}</span>
                                </td>
                                <td class="p-4 border-r-4 border-black font-bold">{{ log.user?.college?.name || 'ROOT' }}</td>
                                <td class="p-4 font-black">{{ log.action }}</td>
                            </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    </div>
    }

  </div>

  <!-- Revoke Modal -->
  @if (showRevokeModal) {
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-black p-6 w-full max-w-sm shadow-[10px_10px_0px_#000] flex flex-col gap-4 text-center">
        <h2 class="text-3xl font-black uppercase text-[#f87171]">⚠️ Revoke Access?</h2>
        <p class="text-sm font-bold text-neutral-600">Are you sure you want to completely revoke admin access from <span class="bg-black text-white px-1">{{ revokeData?.adminName }}</span>? They will become a regular student instantly.</p>
        
        <div class="flex flex-col gap-3 mt-4">
          <button (click)="confirmRevoke()" class="w-full border-4 border-black bg-[#f87171] text-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
            YES, REVOKE IT
          </button>
          <button (click)="closeRevokeModal()" class="w-full border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  }

</div>
  `,
  styles: [`
    .stat-card {
      border: 4px solid black;
      padding: 1.5rem;
      box-shadow: 6px 6px 0px #000;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);
  private collegeService = inject(CollegeService);
  private adminLogService = inject(AdminLogService);
  private snackbar = inject(MatSnackBar);
  private router = inject(Router);

  activeTab: 'colleges' | 'logs' = 'colleges';

  analytics = signal<any>(null);
  colleges = signal<any[]>([]);
  logs = signal<any[]>([]);

  logFilterCollege = '';
  searchQuery = '';

  // Modal Context
  showRevokeModal = false;
  revokeData: { collegeId: string, adminId: string, adminName: string } | null = null;

  get filteredColleges() {
     if (!this.searchQuery) return this.colleges();
     return this.colleges().filter(c => c.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  ngOnInit() {
    this.loadAnalytics();
    this.loadColleges();
    this.fetchLogs();
  }

  loadAnalytics() {
    this.analyticsService.getPlatformAnalytics().subscribe({
      next: (res) => this.analytics.set(res)
    });
  }

  loadColleges() {
    this.collegeService.getDeepColleges().subscribe({
        next: (res) => this.colleges.set(res.colleges)
    });
  }

  fetchLogs() {
    this.adminLogService.getAdminLogs({ collegeId: this.logFilterCollege }).subscribe({
        next: (res) => this.logs.set(res.logs)
    });
  }

  openRevokeModal(collegeId: string, adminId: string, adminName: string) {
      this.revokeData = { collegeId, adminId, adminName };
      this.showRevokeModal = true;
  }

  closeRevokeModal() {
      this.showRevokeModal = false;
      this.revokeData = null;
  }

  confirmRevoke() {
      if (!this.revokeData) return;
      this.collegeService.revokeCollegeAdmin(this.revokeData.collegeId, this.revokeData.adminId).subscribe({
          next: () => {
              this.snackbar.open("Admin Privileges Revoked", "OK", { duration: 3000 });
              this.loadColleges();
              this.fetchLogs();
              this.loadAnalytics();
              this.closeRevokeModal();
          },
          error: (err) => {
              this.snackbar.open(err.error?.message || "Failed to revoke", "OK", { duration: 3000 });
              this.closeRevokeModal();
          }
      });
  }

  viewCollegeEvents(collegeId: string) {
      // Navigating the superadmin to the registrations/manage grid
      // Although we haven't strictly written college filtering in registrations view, 
      // the superadmin will go to the unified grid where they can navigate per event.
      this.router.navigate(['/admin/registrations'], { queryParams: { collegeFilterId: collegeId } });
  }
}