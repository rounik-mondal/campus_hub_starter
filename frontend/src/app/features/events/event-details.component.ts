import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { TokenService } from '../../core/services/token.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CommentService } from '../../core/services/comment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] p-6 lg:p-12 relative overflow-hidden font-mono">
      <div class="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="relative z-10 max-w-4xl mx-auto flex flex-col gap-6 pt-12">
        <button (click)="goBack()" class="w-fit border-4 border-black bg-white px-4 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          ← BACK TO EVENTS
        </button>

        @if (loading()) {
            <div class="w-full h-64 bg-gray-200 animate-pulse border-4 border-black"></div>
        } @else if (event()) {
            <!-- Event Hero -->
            <div class="bg-white border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col md:flex-row">
                <div class="flex-1 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#fde68a]">
                    <span class="inline-block px-3 py-1 bg-black text-white text-xs font-black shadow-[3px_3px_0px_#f472b6] mb-4">
                        {{ event().category | uppercase }}
                    </span>
                    <h1 class="text-4xl md:text-5xl font-black uppercase leading-tight mb-4">
                        {{ event().title }}
                    </h1>
                    <p class="text-lg font-bold text-neutral-800">{{ event().description }}</p>
                </div>
                <div class="w-full md:w-1/3 bg-white p-6 flex flex-col justify-center gap-4">
                    <p class="font-black text-xl uppercase">📅 {{ event().startDate | date:'MMM dd, yyyy' }}</p>
                    <p class="font-black text-xl uppercase">📍 {{ event().location }}</p>
                    @if (event().isPaid) {
                        <p class="font-black text-xl text-[#f472b6]">💵 \${{ event().ticketPrice }}</p>
                    } @else {
                        <p class="font-black text-xl text-[#16a34a]">🆓 FREE ENTRY</p>
                    }
                </div>
            </div>

            <!-- Contextual Status Area -->
            <div class="mt-8">
                @if (userRegistration()) {
                    <div class="bg-[#bbf7d0] border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                        <h2 class="text-2xl font-black mb-4">YOUR REGISTRATION SUMMARY</h2>
                        <div class="flex flex-col md:flex-row gap-6 items-center">
                            @if (qrCodeDataUrl()) {
                                <div class="bg-white border-4 border-black p-2">
                                    <img [src]="qrCodeDataUrl()" alt="QR Code" class="w-32 h-32 object-contain" />
                                </div>
                            }
                            <div class="flex-1 space-y-2">
                                <p class="text-lg font-bold">Status: <span class="bg-black text-white px-2 py-1 uppercase text-sm font-black">{{ userRegistration().status }}</span></p>
                                <p class="text-sm font-bold text-neutral-600">Registered at: {{ userRegistration().timestamp | date:'medium' }}</p>
                            </div>
                            <div>
                                <button (click)="showFeedbackModal = true" [disabled]="userRegistration().status !== 'approved'" class="border-4 border-black bg-[#f472b6] text-black px-6 py-4 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 text-xl whitespace-nowrap">
                                    LEAVE FEEDBACK
                                </button>
                                @if (userRegistration().status !== 'approved') {
                                    <p class="text-xs font-bold text-center mt-2">(Must be approved to review)</p>
                                }
                            </div>
                        </div>
                    </div>
                } @else {
                    <div class="bg-white border-4 border-black p-8 text-center shadow-[8px_8px_0px_#000]">
                        <h2 class="text-3xl font-black mb-4">NOT REGISTERED YET</h2>
                        <p class="text-lg font-bold mb-6">Secure your spot before seats run out!</p>
                        <button (click)="goToRegistration()" class="border-4 border-black bg-[#a78bfa] text-white px-8 py-4 font-black shadow-[6px_6px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-2xl uppercase">
                            REGISTER NOW
                        </button>
                    </div>
                }
            </div>
            
            <!-- Feedbacks Section -->
            @if (feedbacks().length > 0) {
            <div class="mt-12 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <h3 class="text-2xl font-black mb-6 border-b-4 border-black pb-2">User Feedbacks</h3>
                <div class="space-y-4">
                    @for (fb of feedbacks(); track fb.id) {
                    <div class="border-4 border-black bg-[#f8fafc] p-4 shadow-[4px_4px_0px_#000]">
                        <div class="flex justify-between items-center mb-2">
                            <p class="font-black uppercase text-sm bg-black text-white px-2 py-1">{{ fb.user?.name || 'Anonymous' }}</p>
                            <p class="font-bold text-xl text-[#eab308]">
                                {{ "★".repeat(fb.rating) }}{{ "☆".repeat(5 - fb.rating) }}
                            </p>
                        </div>
                        <p class="font-bold text-neutral-800">{{ fb.comments }}</p>
                        <p class="text-xs font-black text-neutral-500 mt-2">{{ fb.timestamp | date:'short' }}</p>
                    </div>
                    }
                </div>
            </div>
            }

            <!-- Comments Section -->
            <div class="mt-12 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <h3 class="text-2xl font-black mb-6 border-b-4 border-black pb-2">Discussion ({{ comments().length || 0 }})</h3>
                
                @if (currentUserId) {
                    <div class="mb-8 flex flex-col gap-2">
                        <textarea [(ngModel)]="newCommentText" placeholder="Add a comment..." rows="2" class="w-full border-4 border-black p-3 font-bold bg-[#f8fafc] shadow-[4px_4px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all resize-none"></textarea>
                        <button (click)="submitComment()" [disabled]="submittingComment || !newCommentText.trim()" class="self-end border-4 border-black bg-[#a78bfa] text-white px-6 py-2 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 uppercase">
                            {{ submittingComment ? 'POSTING...' : 'POST COMMENT' }}
                        </button>
                    </div>
                }

                <div class="space-y-6">
                    @for (comment of comments(); track comment.id) {
                    <div class="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-black uppercase text-sm bg-black text-white px-2 py-1">{{ comment.user?.name }}</span>
                                @if (comment.user?.role === 'super_admin' || comment.user?.role === 'college_admin') {
                                    <span class="text-[0.65rem] font-black bg-[#fde68a] border-2 border-black px-1">ADMIN</span>
                                }
                            </div>
                            <span class="text-xs font-black text-neutral-500">{{ comment.timestamp | date:'shortTime' }}</span>
                        </div>
                        <p class="font-bold text-neutral-800 mb-2">{{ comment.content }}</p>
                        
                        @if (currentUserId) {
                            <button (click)="replyingToId = replyingToId === comment.id ? null : comment.id" class="text-xs font-black uppercase text-[#f472b6] hover:underline">
                                ↪ Reply
                            </button>
                        }

                        <!-- Replies -->
                        @if (comment.replies && comment.replies.length > 0) {
                            <div class="mt-4 pl-4 border-l-4 border-black space-y-4">
                                @for (reply of comment.replies; track reply.id) {
                                <div class="bg-[#f8fafc] border-2 border-black p-3">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="font-black text-xs">{{ reply.user?.name }}</span>
                                        <span class="text-[0.65rem] font-bold text-neutral-500">{{ reply.timestamp | date:'shortTime' }}</span>
                                    </div>
                                    <p class="font-bold text-sm">{{ reply.content }}</p>
                                </div>
                                }
                            </div>
                        }

                        <!-- Reply Input Box -->
                        @if (replyingToId === comment.id) {
                            <div class="mt-4 flex flex-col gap-2 pl-4 border-l-4 border-black">
                                <textarea [(ngModel)]="replyText" placeholder="Write a reply..." rows="1" class="w-full border-2 border-black p-2 font-bold focus:outline-none text-sm resize-none"></textarea>
                                <div class="flex gap-2 self-end">
                                    <button (click)="submitReply(comment.id)" [disabled]="submittingComment || !replyText.trim()" class="border-2 border-black bg-black text-white px-4 py-1 text-xs font-black hover:bg-neutral-800 disabled:opacity-50">
                                        REPLY
                                    </button>
                                    <button (click)="replyingToId = null" class="border-2 border-black bg-white px-4 py-1 text-xs font-black">
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        }

                    </div>
                    } @empty {
                        <p class="font-bold text-neutral-500 italic text-center py-4">No comments yet. Start the discussion!</p>
                    }
                </div>
            </div>

        } @else {
            <div class="text-center mt-12 bg-[#fecaca] border-4 border-black p-8">
                <h2 class="text-2xl font-black">Event Not Found</h2>
            </div>
        }
      </div>

      <!-- Feedback Modal -->
      @if (showFeedbackModal) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div class="bg-white border-4 border-black p-8 w-full max-w-lg shadow-[10px_10px_0px_#000] flex flex-col gap-4">
                  <h2 class="text-3xl font-black mb-2">Leave Feedback</h2>
                  <p class="text-sm font-bold text-neutral-600 mb-4">How was the event? Rate and leave comments below.</p>
                  
                  <div class="flex justify-center gap-2 mb-4">
                      @for (star of [1,2,3,4,5]; track star) {
                          <button (click)="feedbackRating = star" class="text-4xl hover:scale-125 transition-transform origin-center outline-none">
                              {{ star <= feedbackRating ? '⭐' : '☆' }}
                          </button>
                      }
                  </div>

                  <textarea [(ngModel)]="feedbackComments" placeholder="Your comments (optional)" rows="4" class="w-full border-4 border-black p-3 font-bold bg-[#f8fafc] shadow-[4px_4px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all resize-none"></textarea>

                  <div class="flex gap-4 mt-4">
                      <button (click)="submitFeedback()" [disabled]="submittingFeedback || feedbackRating < 1" class="flex-1 border-4 border-black bg-[#fde68a] px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                          {{ submittingFeedback ? 'SUBMITTING...' : 'SUBMIT' }}
                      </button>
                      <button (click)="showFeedbackModal = false" [disabled]="submittingFeedback" class="w-1/3 border-4 border-black bg-white px-4 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                          CANCEL
                      </button>
                  </div>
              </div>
          </div>
      }

    </div>
  `
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private tokenService = inject(TokenService);
  private location = inject(Location);
  private feedbackService = inject(FeedbackService);
  private commentService = inject(CommentService);
  private snackbar = inject(MatSnackBar);

  event = signal<any>(null);
  loading = signal(true);
  feedbacks = signal<any[]>([]);
  comments = signal<any[]>([]);
  
  userRegistration = signal<any>(null);
  qrCodeDataUrl = signal<string | null>(null);

  showFeedbackModal = false;
  feedbackRating = 0;
  feedbackComments = '';
  submittingFeedback = false;

  replyingToId: string | null = null;
  replyText = '';
  newCommentText = '';
  submittingComment = false;

  currentUserId = this.tokenService.getUser()?.id;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEvent(id);
      this.fetchFeedbacks(id);
      this.fetchComments(id);
    } else {
      this.loading.set(false);
    }
  }

  fetchEvent(id: string) {
    this.eventService.getEventById(id).subscribe({
      next: (res) => {
        this.event.set(res);
        if (this.currentUserId && res.registrations) {
            const reg = res.registrations.find((r: any) => r.userId === this.currentUserId);
            if (reg) {
                this.userRegistration.set(reg);
                
                // If there's an event payload we could parse it, but for now we'll mimic the generic success QR logic
                // The actual backend registration structure might differ visually, so we parse basic fallback payload if missing.
                const fallbackPayload = JSON.stringify({ eventId: res.id, userId: this.currentUserId, registrationId: reg.id });
                QRCode.toDataURL(fallbackPayload, { width: 256, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
                    .then(url => this.qrCodeDataUrl.set(url))
                    .catch(err => console.error("QR formatting failed", err));
            }
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  fetchFeedbacks(id: string) {
      if (!this.currentUserId) return; // public view doesn't necessarily need it, but let's allow it if we want
      this.feedbackService.getEventFeedbacks(id).subscribe({
          next: (res) => {
              this.feedbacks.set(res.feedbacks || []);
          },
          error: (err) => console.error(err)
      });
  }

  goBack() {
    this.location.back();
  }

  goToRegistration() {
      // Just send them back to the event-list to trigger the specific modal pipeline
      // We'll pass the ID so the component can ideally pop the exact modal
      this.router.navigate(['/events'], { queryParams: { registerContextId: this.event()?.id } });
  }

  submitFeedback() {
      if (this.feedbackRating < 1 || this.feedbackRating > 5) return;
      this.submittingFeedback = true;
      
      this.feedbackService.createFeedback(this.event()?.id, this.feedbackRating, this.feedbackComments).subscribe({
          next: () => {
              this.snackbar.open("Feedback submitted! ⭐", "Ok", { duration: 3000 });
              this.submittingFeedback = false;
              this.showFeedbackModal = false;
              this.fetchFeedbacks(this.event()?.id);
          },
          error: (err) => {
              this.submittingFeedback = false;
              this.snackbar.open(err.error?.message || "Failed to submit feedback", "Ok", { duration: 3000 });
          }
      });
  }

  fetchComments(id: string) {
      this.commentService.getEventComments(id).subscribe({
          next: (res) => this.comments.set(res.comments || []),
          error: (err) => console.error(err)
      });
  }

  submitComment() {
      if (!this.newCommentText.trim() || !this.event()?.id) return;
      this.submittingComment = true;
      this.commentService.postComment(this.event().id, this.newCommentText).subscribe({
          next: () => {
              this.newCommentText = '';
              this.submittingComment = false;
              this.fetchComments(this.event().id);
          },
          error: (err) => {
              this.submittingComment = false;
              this.snackbar.open(err.error?.message || "Failed to post comment", "Ok", { duration: 3000 });
          }
      });
  }

  submitReply(parentId: string) {
      if (!this.replyText.trim() || !this.event()?.id) return;
      this.submittingComment = true;
      this.commentService.postComment(this.event().id, this.replyText, parentId).subscribe({
          next: () => {
              this.replyText = '';
              this.replyingToId = null;
              this.submittingComment = false;
              this.fetchComments(this.event().id);
          },
          error: (err) => {
              this.submittingComment = false;
              this.snackbar.open(err.error?.message || "Failed to reply", "Ok", { duration: 3000 });
          }
      });
  }
}
