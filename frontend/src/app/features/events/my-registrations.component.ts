import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RegistrationService, Registration } from '../../core/services/registration.service';
import { TokenService } from '../../core/services/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-my-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  <div class="max-w-6xl mx-auto space-y-10 relative z-10">

    <div class="relative text-center mb-10">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#f472b6] border-4 border-black">
        🎟️ My Registrations
      </h1>
    </div>

    @if (loading()) {
      <div class="text-center font-black animate-pulse text-2xl">LOADING...</div>
    } @else if (registrations().length === 0) {
      <div class="rounded-[2.5rem] border-4 border-black bg-[#f472b6] p-4 shadow-[16px_16px_0px_#000]">
        <div class="rounded-[2rem] border-4 border-black bg-white p-14 text-center shadow-[8px_8px_0px_#000]">
          <span class="text-7xl block animate-bounce">🎟️</span>
          <h3 class="text-2xl font-black">NO REGISTRATIONS</h3>
        </div>
      </div>
    } @else {
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        @for (reg of registrations(); track reg.id) {
          <div class="group rounded-3xl border-4 border-black bg-white p-6 shadow-[10px_10px_0px_#000] transition-all hover:-translate-y-1">
            <a [routerLink]="['/events', reg.event?.id]" class="text-xl font-black mb-1 hover:text-[#f472b6] transition-colors cursor-pointer block hover:underline">{{ reg.event?.title || 'Unknown Event' }}</a>
            <p class="text-sm font-bold text-neutral-600 mb-2">{{ reg.event?.college?.name }}</p>
            <p class="text-xs font-bold bg-neutral-100 p-2 border-2 border-black inline-block mb-4 shadow-[2px_2px_0px_#000]">
              📅 {{ reg.event?.startDate | date:'medium' }}
            </p>

            <div class="mb-4">
              <span class="inline-block px-3 py-1 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
                [class.bg-[#fde68a]]="reg.status === 'pending'"
                [class.bg-[#bbf7d0]]="reg.status === 'approved'"
                [class.bg-[#fecaca]]="reg.status === 'rejected'"
                [class.bg-[#9ca3af]]="reg.status === 'CANCELLED'"
                [class.bg-[#e0f2fe]]="reg.status === 'awaiting_admin_approval'">
                {{ reg.status.replace('_', ' ').replace('_', ' ') | uppercase }}
              </span>
            </div>

            @if (reg.qrPayload) {
              <div class="border-4 border-black bg-white p-3 mb-4 text-center flex flex-col items-center">
                <div class="w-full h-auto bg-gray-200 border-4 border-black flex items-center justify-center overflow-hidden p-2">
                  @if (qrCodeDataUrls[reg.id]) {
                     <img [src]="qrCodeDataUrls[reg.id]" alt="QR Code" class="w-24 h-24 sm:w-32 sm:h-32 object-contain" />
                  } @else {
                     <span class="font-black text-xs">GENERATING QR...</span>
                  }
                </div>
                <p class="text-[0.6rem] font-black mt-1 uppercase text-neutral-500">Scan at Entry</p>
              </div>
            }

            @if (reg.team && reg.event?.isTeamEvent) {
              <div class="border-4 border-black bg-[#e0f2fe] p-3 mb-4 shadow-[4px_4px_0px_#000]">
                <h4 class="font-black text-sm border-b-2 border-black pb-1 mb-2">🤝 Team Summary</h4>
                
                <h4 class="font-black text-[0.65rem] uppercase text-neutral-600 mb-1">Members</h4>
                <ul class="text-xs font-bold space-y-1 mb-3">
                  @for (member of reg.team.members; track member.userId) {
                    <li>
                      👤 {{ member.user?.name || member.user?.email }} 
                      @if(member.role === 'CREATOR') { <span class="bg-yellow-200 border border-black px-1 ml-1 text-[0.6rem]">LEAD</span> }
                    </li>
                  }
                </ul>

                @if ((reg.invitations?.length ?? 0) > 0) {
                  <h4 class="font-black text-[0.65rem] uppercase text-neutral-600 mb-1">Invitation Status</h4>
                  <ul class="text-xs space-y-1 mb-3">
                    @for (inv of reg.invitations; track inv.id) {
                      <li class="flex justify-between border-b-2 border-dashed border-black pb-1 items-center">
                        <span class="font-bold truncate max-w-[120px]">{{ inv.inviteeEmail }}</span>
                        <span class="font-black uppercase text-[0.65rem] border border-black px-1" 
                          [class.bg-[#fde68a]]="inv.status === 'pending'"
                          [class.bg-[#bbf7d0]]="inv.status === 'accepted' || inv.status === 'awaiting_admin_approval'"
                          [class.bg-[#fecaca]]="inv.status === 'declined'"
                          [class.bg-[#f472b6]]="inv.status === 'payment_pending'">
                          {{ inv.status.replace('_', ' ') }}
                        </span>
                      </li>
                    }
                  </ul>
                }

                @if (isTeamLead(reg)) {
                   <button (click)="openInviteModal(reg)" class="w-full border-4 border-black bg-black text-white px-3 py-1 mt-2 text-xs font-black shadow-[2px_2px_0px_#f472b6] hover:translate-x-1 hover:translate-y-1 transition-all">
                     + INVITE TEAMMATE
                   </button>
                }
              </div>
            }

            <div class="mt-4 pt-4 border-t-4 border-black text-center">
              @if (reg.status === 'pending' || reg.status === 'approved') {
                <button (click)="openCancelModal(reg.id)"
                  class="border-4 border-black bg-[#f87171] text-black px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:-translate-y-1 transition-all w-full">
                  CANCEL REGISTRATION
                </button>
              } @else if (reg.status === 'CANCELLED') {
                <span class="text-sm font-black text-neutral-500 bg-neutral-200 border-2 border-black inline-block px-4 py-2 w-full">
                  REGISTRATION CANCELLED
                </span>
              }
            </div>
          </div>
        }
      </div>
    }
  </div>

  <!-- INVITE MODAL -->
  @if (showInviteModal) {
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-black p-6 md:p-8 w-full max-w-md rounded-xl shadow-[10px_10px_0px_#000] flex flex-col gap-4 max-h-[90vh]">
        <h2 class="text-2xl font-black">Invite Teammate</h2>
        <p class="text-sm font-bold text-neutral-600">Event: {{ selectedRegForInvite?.event?.title }}</p>
        
        <div class="relative">
          <input type="text" [(ngModel)]="inviteEmail" (ngModelChange)="onSearchChange($event)" placeholder="Search Name or Email..." autocomplete="off" class="w-full border-4 border-black px-4 py-3 font-bold shadow-[4px_4px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all">
          
          @if (searchResults.length > 0) {
             <div class="absolute left-0 right-0 top-full mt-2 border-4 border-black bg-white max-h-48 overflow-y-auto z-50 shadow-[4px_4px_0px_#000]">
               @for (user of searchResults; track user.id) {
                  <div (click)="selectSearchResult(user)" class="p-3 border-b-2 border-dashed border-black hover:bg-[#e0f2fe] cursor-pointer font-black transition-colors">
                     {{ user.name }} <span class="text-xs text-neutral-600 block">{{ user.email }}</span>
                  </div>
               }
             </div>
          }
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 mt-4">
          <button (click)="sendInvite()" [disabled]="sendingInvite || !inviteEmail" class="flex-1 border-4 border-black bg-[#bbf7d0] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 transition-all">
            {{ sendingInvite ? 'SENDING...' : 'SEND INVITE' }}
          </button>
          <button (click)="closeInviteModal()" [disabled]="sendingInvite" class="flex-1 border-4 border-black bg-[#fecaca] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 transition-all">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  }

  <!-- CANCEL MODAL -->
  @if (showCancelModal) {
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-black p-6 md:p-8 w-full max-w-md rounded-xl shadow-[10px_10px_0px_#000] flex flex-col gap-4 text-center">
        <h2 class="text-3xl font-black mb-2">⚠️ Cancel Registration</h2>
        <p class="text-sm font-bold text-neutral-600 mb-4">Are you sure you want to cancel your registration for this event? This action cannot be undone.</p>
        
        <div class="flex flex-col sm:flex-row gap-4 mt-2">
          <button (click)="confirmCancel()" class="flex-1 border-4 border-black bg-[#f87171] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-white">
            YES, CANCEL IT
          </button>
          <button (click)="closeCancelModal()" class="flex-1 border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            GO BACK
          </button>
        </div>
      </div>
    </div>
  }

</div>
  `
})
export class MyRegistrationsComponent implements OnInit {
  private regService = inject(RegistrationService);
  private snackBar = inject(MatSnackBar);
  private tokenService = inject(TokenService);
  private http = inject(HttpClient);

  registrations = signal<Registration[]>([]);
  loading = signal(true);
  
  qrCodeDataUrls: Record<string, string> = {};
  
  showInviteModal = false;
  selectedRegForInvite: Registration | null = null;
  inviteEmail = '';
  sendingInvite = false;
  searchResults: any[] = [];
  searchTimeout: any;

  currentUserId = this.tokenService.getUser()?.id;

  ngOnInit() {
    this.fetchData();
  }

  onSearchChange(query: string) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (!query || query.length < 2) {
       this.searchResults = [];
       return;
    }
    
    this.searchTimeout = setTimeout(() => {
       if (!this.selectedRegForInvite?.event?.id) return;
       this.http.get<any>(`${environment.apiUrl}/teams/search-users?eventId=${this.selectedRegForInvite.event.id}&query=${query}`)
         .subscribe({
           next: (res) => this.searchResults = res.users || [],
           error: () => this.searchResults = []
         });
    }, 300);
  }

  selectSearchResult(user: any) {
    this.inviteEmail = user.email;
    this.searchResults = [];
  }

  fetchData() {
    this.regService.getMyRegistrations().subscribe({
      next: (res) => {
        this.registrations.set(res.registrations);
        this.loading.set(false);
        
        res.registrations.forEach(reg => {
          if (reg.qrPayload) {
            QRCode.toDataURL(reg.qrPayload, { width: 256, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
              .then(url => {
                this.qrCodeDataUrls[reg.id] = url;
              })
              .catch(err => console.error("QR Code Error:", err));
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  showCancelModal = false;
  selectedRegToCancel: string | null = null;

  openCancelModal(id: string) {
    this.selectedRegToCancel = id;
    this.showCancelModal = true;
  }
  
  closeCancelModal() {
    this.showCancelModal = false;
    this.selectedRegToCancel = null;
  }
  
  confirmCancel() {
    if (!this.selectedRegToCancel) return;
    this.regService.cancelRegistration(this.selectedRegToCancel).subscribe({
      next: () => {
        this.snackBar.open("Registration Cancelled", "OK", { duration: 3000 });
        this.fetchData(); 
        this.closeCancelModal();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || "Failed to cancel", "OK", { duration: 3000 });
        this.closeCancelModal();
      }
    });
  }

  isTeamLead(reg: Registration): boolean {
    if (!reg.team || !this.currentUserId) return false;
    const isLead = reg.team.members.find((m: any) => m.userId === this.currentUserId && m.role === 'CREATOR');
    return !!isLead;
  }

  openInviteModal(reg: Registration) {
    this.selectedRegForInvite = reg;
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.searchResults = [];
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.selectedRegForInvite = null;
    this.inviteEmail = '';
    this.searchResults = [];
  }

  sendInvite() {
    if (!this.inviteEmail || !this.selectedRegForInvite?.team) return;
    this.sendingInvite = true;
    
    this.http.post<any>(`${environment.apiUrl}/teams/invite`, {
      teamId: this.selectedRegForInvite.team.id,
      inviteeEmail: this.inviteEmail
    }).subscribe({
      next: (res) => {
        this.snackBar.open("Invite Sent!", "OK", { duration: 3000 });
        this.sendingInvite = false;
        
        // Dynamically append the invite matching the new API structure
        if (res.invitedUser && res.invitation) {
           this.selectedRegForInvite!.invitations = this.selectedRegForInvite!.invitations || [];
           this.selectedRegForInvite!.invitations.push({
             id: Math.random().toString(), // temporary mock id if not returned directly
             inviteeEmail: res.invitedUser.email,
             status: res.invitation.status
           });
        } else {
           this.fetchData(); // fallback to heavy refresh if standard objects missing
        }
        
        this.closeInviteModal();
      },
      error: (err) => {
        this.sendingInvite = false;
        this.snackBar.open(err.error?.message || "Failed to invite teammate", "OK", { duration: 3000 });
      }
    });
  }
}
