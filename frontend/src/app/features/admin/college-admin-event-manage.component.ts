import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { RegistrationService } from '../../core/services/registration.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CommentService, CommentNode } from '../../core/services/comment.service';
import { TokenService } from '../../core/services/token.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-college-admin-event-manage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="min-h-screen bg-[#f8fafc] px-6 py-12 relative overflow-hidden font-mono">
  
  <div class="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

  <div class="max-w-7xl mx-auto space-y-10 relative z-10 animate-fade-in">
      
    <!-- Header Block -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#f472b6]">
      <div>
          <button (click)="goBack()" class="mb-4 text-xs font-black uppercase hover:underline">← Back to Dashboard</button>
          <h1 class="text-3xl md:text-5xl font-black uppercase text-black line-clamp-1">
              {{ event()?.title || 'Loading Event...' }}
          </h1>
          <div class="flex gap-2 mt-4 text-xs font-bold uppercase">
              <span class="bg-[#fde68a] border-2 border-black px-2 py-1 shadow-[2px_2px_0px_#000]">{{ event()?.category || 'General' }}</span>
              <span class="bg-black text-white px-2 py-1 shadow-[2px_2px_0px_#000]">{{ event()?.scope || 'Global' }}</span>
          </div>
      </div>
      <div class="flex gap-4">
          <div class="bg-[#bbf7d0] border-4 border-black px-6 py-4 shadow-[4px_4px_0px_#000] text-center">
              <p class="text-3xl font-black">\${{ calculatedRevenue }}</p>
              <p class="text-xs font-bold uppercase">Event Revenue</p>
          </div>
      </div>
    </div>

    <!-- Layout Grids -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Quick Stats & Registrations -->
        <div class="lg:col-span-2 space-y-8">
            
            <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <div class="flex justify-between items-end mb-6 border-b-4 border-black pb-2">
                    <h2 class="text-2xl font-black uppercase">Registrations ({{ participants().length }})</h2>
                    <select [(ngModel)]="filterStatus" class="border-4 border-black font-bold p-1 focus:outline-none bg-neutral-100">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    @for (p of filteredParticipants; track p.id) {
                    <div class="bg-[#f8fafc] border-2 border-black p-4 flex flex-col justify-between">
                        <div>
                            <p class="font-black text-lg truncate">{{ p.user?.name }}</p>
                            <p class="text-xs font-bold text-neutral-600 truncate">{{ p.user?.email }}</p>
                            <span class="inline-block px-2 py-1 text-[0.6rem] font-black border-2 border-black rounded shadow-[2px_2px_0px_#000] mt-2 uppercase"
                                [class.bg-[#fde68a]]="p.status === 'pending'"
                                [class.bg-[#bbf7d0]]="p.status === 'approved' || p.status === 'accepted'"
                                [class.bg-[#fecaca]]="p.status === 'rejected' || p.status === 'declined'">
                                {{ p.status }}
                            </span>
                        </div>
                        
                        @if (!isSuperAdmin) {
                            @if (p.status === 'pending' || p.status === 'awaiting_admin_approval') {
                                <div class="flex gap-2 mt-4 pt-4 border-t-2 border-black border-dashed">
                                    <button (click)="openStatusModal(p, 'approved')" class="flex-1 bg-[#bbf7d0] border-2 border-black font-black py-1 text-xs hover:bg-[#86efac] transition-colors">APPROVE</button>
                                    <button (click)="openStatusModal(p, 'rejected')" class="flex-1 bg-[#fecaca] border-2 border-black font-black py-1 text-xs hover:bg-[#fca5a5] transition-colors">REJECT</button>
                                </div>
                            }
                        }
                    </div>
                    } @empty {
                        <p class="font-bold text-neutral-500 italic col-span-2">No participants match your criteria.</p>
                    }
                </div>
            </div>

            <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <h2 class="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">Feedback & Ratings</h2>
                
                @if (feedbacks().length === 0) {
                    <p class="font-bold text-neutral-500 italic">No feedback received for this event yet.</p>
                } @else {
                    <div class="space-y-4">
                        @for (fb of feedbacks(); track fb.id) {
                        <div class="border-2 border-black bg-[#fffbeb] p-4 flex flex-col gap-2">
                            <div class="flex justify-between items-center">
                                <span class="font-black text-sm uppercase bg-black text-white px-2 py-1">{{ fb.user?.name || 'Anonymous' }}</span>
                                <span class="font-bold text-lg text-[#eab308]">{{ "★".repeat(fb.rating) }}{{ "☆".repeat(5 - fb.rating) }}</span>
                            </div>
                            <p class="font-bold text-sm text-neutral-800">{{ fb.comments }}</p>
                        </div>
                        }
                    </div>
                }
            </div>

        </div>

        <!-- Right Column: Comments Module -->
        <div class="space-y-8">
            <div class="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <h2 class="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2">Discussion Threads</h2>
                
                <div class="flex flex-col gap-6">
                    @for (comment of comments(); track comment.id) {
                        <div class="bg-[#f8fafc] border-2 border-black p-3">
                            <div class="flex justify-between mb-1">
                                <span class="font-black text-sm uppercase leading-tight">{{ comment.user.name }}</span>
                            </div>
                            <p class="font-bold text-sm mb-3">{{ comment.content }}</p>
                            
                            <!-- Replies -->
                            @if (comment.replies && comment.replies.length > 0) {
                                <div class="ml-2 pl-2 border-l-4 border-black space-y-2 mt-2">
                                    @for (reply of comment.replies; track reply.id) {
                                        <div>
                                            <span class="font-black text-[0.65rem] uppercase block mb-0.5">{{ reply.user.name }}</span>
                                            <p class="font-bold text-xs">{{ reply.content }}</p>
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    } @empty {
                        <p class="font-bold text-neutral-500 italic">No comments to display.</p>
                    }
                </div>
            </div>
        </div>

    </div>

  </div>

  <!-- Status Transition Modal -->
  @if (showStatusModal) {
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white border-4 border-black p-6 md:p-8 w-full max-w-sm rounded-xl shadow-[10px_10px_0px_#000] flex flex-col gap-4 text-center">
        <h2 class="text-3xl font-black mb-2 uppercase">{{ intendedStatus }} User?</h2>
        <p class="text-sm font-bold text-neutral-600 mb-4">Are you sure you want to transition <b>{{ selectedParticipant?.user?.name }}</b> to <b>{{ intendedStatus | uppercase }}</b>?</p>
        
        <div class="flex flex-col gap-3 mt-2">
          <button (click)="confirmStatusUpdate()" class="w-full border-4 border-black px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
            [class.bg-[#bbf7d0]]="intendedStatus === 'approved'"
            [class.bg-[#fecaca]]="intendedStatus === 'rejected'">
            YES, {{ intendedStatus }}
          </button>
          <button (click)="closeStatusModal()" class="w-full border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            CANCEL
          </button>
        </div>
      </div>
    </div>
  }

</div>
  `
})
export class CollegeAdminEventManageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private eventService = inject(EventService);
    private registrationService = inject(RegistrationService);
    private feedbackService = inject(FeedbackService);
    private commentService = inject(CommentService);
    private tokenService = inject(TokenService);
    private snackbar = inject(MatSnackBar);

    eventId = '';
    event = signal<any>(null);
    participants = signal<any[]>([]);
    feedbacks = signal<any[]>([]);
    comments = signal<CommentNode[]>([]);

    filterStatus = '';
    
    isSuperAdmin = false;

    // Modal States
    showStatusModal = false;
    selectedParticipant: any = null;
    intendedStatus = '';

    get filteredParticipants() {
        if (!this.filterStatus) return this.participants();
        return this.participants().filter(p => p.status === this.filterStatus);
    }

    get calculatedRevenue() {
        const ev = this.event();
        if (!ev || !ev.isPaid) return 0;
        const validParticipants = this.participants().filter(p => p.status === 'approved' || p.status === 'accepted');
        return validParticipants.length * ev.ticketPrice;
    }

    ngOnInit() {
        const role = this.tokenService.getUser()?.role;
        this.isSuperAdmin = role === 'super_admin';

        this.eventId = this.route.snapshot.paramMap.get('id') || '';
        if (this.eventId) {
            this.loadAssets();
        }
    }

    loadAssets() {
        this.eventService.getEventById(this.eventId).subscribe({
            next: (res) => this.event.set(res)
        });

        this.registrationService.getEventParticipants(this.eventId).subscribe({
            next: (res) => this.participants.set(res.participants)
        });

        this.feedbackService.getEventFeedbacks(this.eventId).subscribe({
            next: (res) => this.feedbacks.set(res.feedbacks || [])
        });

        this.commentService.getEventComments(this.eventId).subscribe({
            next: (res) => this.comments.set(res.comments || [])
        });
    }

    goBack() {
        this.location.back();
    }

    // Modal Handlers
    openStatusModal(participant: any, status: string) {
        this.selectedParticipant = participant;
        this.intendedStatus = status;
        this.showStatusModal = true;
    }

    closeStatusModal() {
        this.selectedParticipant = null;
        this.intendedStatus = '';
        this.showStatusModal = false;
    }

    confirmStatusUpdate() {
        if (!this.selectedParticipant || !this.intendedStatus) return;

        const observerBase = {
            next: () => {
                this.snackbar.open(`Successfully ${this.intendedStatus}`, "OK", { duration: 3000 });
                // Re-fetch participants to sync UI securely
                this.registrationService.getEventParticipants(this.eventId).subscribe({
                    next: (res) => this.participants.set(res.participants)
                });
                this.closeStatusModal();
            },
            error: (err: any) => {
                this.snackbar.open(err.error?.message || "Failed update", "OK", { duration: 3000 });
                this.closeStatusModal();
            }
        };

        if (this.selectedParticipant.isInvitation) {
            const backendStatus = this.intendedStatus === 'rejected' ? 'declined' : 'approved';
            this.registrationService.adminApproveInvite(this.selectedParticipant.id, backendStatus).subscribe(observerBase);
        } else {
            this.registrationService.updateRegistrationStatus(this.selectedParticipant.id, this.intendedStatus).subscribe(observerBase);
        }
    }
}
