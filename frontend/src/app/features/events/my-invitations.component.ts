import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-invitations',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="min-h-screen px-6 py-12 relative overflow-hidden">
  <div class="max-w-4xl mx-auto space-y-10 relative z-10">

    <div class="relative text-center mb-10">
      <h1 class="text-5xl md:text-6xl font-black tracking-tighter uppercase bg-black text-white inline-block px-6 py-3 rotate-[-1deg] shadow-[10px_10px_0px_#f472b6] border-4 border-black">
        ✉️ My Invitations
      </h1>
    </div>

    @if (loading()) {
      <div class="text-center font-black animate-pulse text-2xl">LOADING...</div>
    } @else if (invitations().length === 0) {
      <div class="rounded-[2.5rem] border-4 border-black bg-[#e0f2fe] p-4 shadow-[16px_16px_0px_#000]">
        <div class="rounded-[2rem] border-4 border-black bg-white p-14 text-center shadow-[8px_8px_0px_#000]">
          <span class="text-7xl block animate-bounce">📭</span>
          <h3 class="text-2xl font-black mt-4">NO INVITATIONS</h3>
          <p class="font-bold text-neutral-500">You don't have any pending team invites right now.</p>
        </div>
      </div>
    } @else {
      <div class="grid gap-6">
        @for (inv of invitations(); track inv.id) {
          <div class="group relative rounded-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_#000] overflow-hidden">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-[#fde68a] rotate-12 -z-10 border-4 border-black opacity-50"></div>
            
            <h3 class="text-2xl font-black mb-1">{{ inv.event?.title }}</h3>
            <p class="text-sm font-bold text-neutral-600 mb-4">Invited by: {{ inv.inviter?.name || inv.inviter?.email }}</p>
            
            <div class="mt-4 border-l-4 border-black pl-4 mb-4">
               <h4 class="font-black text-sm uppercase text-neutral-500 mb-2">Team Summary</h4>
               <div class="flex flex-wrap gap-2">
                 @for (member of inv.team?.members; track member.id) {
                     <p class="text-xs font-bold bg-[#bbf7d0] inline-block px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                        {{ member.user?.name || member.user?.email }} ({{ member.role === 'CREATOR' ? 'Team Leader' : 'Member' }})
                     </p>
                 }
                 @for (invite of inv.team?.invitations; track invite.id) {
                     <p class="text-xs font-bold bg-[#e0f2fe] inline-block px-2 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
                        {{ invite.inviteeEmail }} ({{ invite.status }})
                     </p>
                 }
               </div>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4 mt-6">
               <button (click)="respond(inv.id, 'accepted', inv.event?.isPaid)" 
                 class="flex-1 border-4 border-black bg-[#4ade80] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                 ACCEPT
               </button>
               <button (click)="respond(inv.id, 'declined', false)" 
                 class="flex-1 border-4 border-black bg-[#f87171] px-4 py-3 font-black text-white shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                 DECLINE
               </button>
            </div>
          </div>
        }
      </div>
    }

  </div>
  
  <!-- PAYMENT MODAL FOR PAID EVENTS -->
  @if (showPaymentModal) {
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-black p-6 md:p-8 w-full max-w-md rounded-xl shadow-[10px_10px_0px_#000] space-y-4">
        <h2 class="text-3xl font-black text-center mb-6">Payment Required</h2>
        <p class="font-bold text-center mb-6">This event requires a team ticket payment before your invitation can be finalized.</p>
        <button (click)="payForInvite()" [disabled]="processingPayment" class="w-full border-4 border-black bg-[#f472b6] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 transition-all text-lg">
          {{ processingPayment ? 'PROCESSING...' : 'CONFIRM PAYMENT' }}
        </button>
        <button (click)="closePaymentModal()" [disabled]="processingPayment" class="w-full border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] mt-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 transition-all text-lg mb-2">
          CANCEL
        </button>
      </div>
    </div>
  }
</div>
  `
})
export class MyInvitationsComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  invitations = signal<any[]>([]);
  loading = signal(true);
  
  showPaymentModal = false;
  processingPayment = false;
  selectedInviteId: string | null = null;

  ngOnInit() {
    this.fetchInvitations();
  }

  fetchInvitations() {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/invitations`).subscribe({
      next: (res) => {
        this.invitations.set(res.invitations || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  respond(inviteId: string, status: string, isPaid: boolean) {
    this.http.post<any>(`${environment.apiUrl}/teams/respond`, { invitationId: inviteId, status }).subscribe({
      next: () => {
         if (status === 'accepted') {
           if (isPaid) {
              this.selectedInviteId = inviteId;
              this.showPaymentModal = true;
           } else {
              this.snackBar.open("Invitation Accepted! Pending Admin Approval.", "OK", { duration: 4000 });
              this.fetchInvitations();
           }
         } else {
            this.snackBar.open("Invitation Declined", "OK", { duration: 3000 });
            this.fetchInvitations();
         }
      },
      error: (err) => this.snackBar.open(err.error?.message || "Failed to process invitation", "OK", { duration: 3000 })
    });
  }
  
  payForInvite() {
    if (!this.selectedInviteId) return;
    this.processingPayment = true;
    
    // Simulate payment directly to the invite payment endpoint
    this.http.post<any>(`${environment.apiUrl}/invitations/${this.selectedInviteId}/pay`, {}).subscribe({
      next: () => {
         this.processingPayment = false;
         this.snackBar.open("Payment Successful! Pending Admin Approval.", "OK", { duration: 4000 });
         this.closePaymentModal();
         this.fetchInvitations();
      },
      error: (err) => {
         this.processingPayment = false;
         this.snackBar.open(err.error?.message || "Payment Failed", "OK", { duration: 3000 });
      }
    });
  }
  
  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedInviteId = null;
    this.processingPayment = false;
  }
}
