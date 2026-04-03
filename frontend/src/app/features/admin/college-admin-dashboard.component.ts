import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-college-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="min-h-screen bg-[#f8fafc] px-6 py-12 relative overflow-hidden font-mono">
  
  <!-- Background dot pattern -->
  <div class="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

  <div class="max-w-6xl mx-auto space-y-10 relative z-10 animate-fade-in">

    <!-- Header Block -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#f472b6]">
      <div>
          <h1 class="text-4xl md:text-5xl font-black uppercase text-black">
              COLLEGE DASHBOARD
          </h1>
          <p class="text-sm font-bold text-neutral-600 uppercase mt-2">
              Viewing insights for {{ collegeName() }}
          </p>
      </div>
      <div class="flex gap-4">
          <a routerLink="/admin/create-event" class="border-4 border-black bg-[#a78bfa] text-white px-6 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase whitespace-nowrap">
              + NEW EVENT
          </a>
          <a routerLink="/admin/registrations" class="border-4 border-black bg-[#bbf7d0] text-black px-6 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase whitespace-nowrap">
              MANAGE EVENTS
          </a>
      </div>
    </div>

    @if (loading()) {
        <div class="h-64 bg-gray-200 animate-pulse border-4 border-black"></div>
    } @else if (analytics()) {
        
        <!-- Key Metrics Grid -->
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            <div class="stat-card bg-[#fde68a]">
                <div class="flex justify-between items-start">
                    <span class="text-4xl">🎉</span>
                    <span class="text-5xl font-black">{{ analytics()?.totalEvents || 0 }}</span>
                </div>
                <p class="font-black mt-4 text-sm border-t-4 border-black pt-2 uppercase">Total Hosted Events</p>
            </div>
            
            <div class="stat-card bg-[#60a5fa]">
                <div class="flex justify-between items-start">
                    <span class="text-4xl">👨‍🎓</span>
                    <span class="text-5xl font-black">{{ analytics()?.totalParticipants || 0 }}</span>
                </div>
                <p class="font-black mt-4 text-sm border-t-4 border-black pt-2 uppercase">Total Participants</p>
            </div>
            
            <div class="stat-card bg-[#4ade80]">
                <div class="flex justify-between items-start">
                    <span class="text-4xl">💰</span>
                    <span class="text-5xl font-black">\${{ analytics()?.totalRevenue || 0 }}</span>
                </div>
                <p class="font-black mt-4 text-sm border-t-4 border-black pt-2 uppercase">Total Revenue</p>
            </div>
            
            <div class="stat-card bg-[#fb923c]">
                <div class="flex justify-between items-start">
                    <span class="text-4xl">⭐</span>
                    <span class="text-5xl font-black">{{ analytics()?.averageRating || 0 }}</span>
                </div>
                <p class="font-black mt-4 text-sm border-t-4 border-black pt-2 uppercase">Avg Rating ({{ analytics()?.totalFeedbacks || 0 }} Reviews)</p>
            </div>

        </div>

        <!-- Deep Insights Row -->
        <div class="grid gap-6 md:grid-cols-2 mt-8">
            
            <!-- Top Performing Event -->
            <div class="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8 flex flex-col gap-4">
                <h3 class="text-2xl font-black border-b-4 border-black pb-2 flex items-center gap-2">
                    <span class="text-3xl">🏆</span> TOP PERFORMING EVENT
                </h3>
                @if (analytics()?.topPerformingEvent; as event) {
                    <div class="flex-1 flex flex-col justify-center">
                        <p class="text-4xl font-black text-[#f472b6] leading-tight">{{ event.title }}</p>
                        <p class="text-xl font-bold mt-2">{{ event.participants }} Attendees</p>
                    </div>
                } @else {
                    <div class="flex-1 flex flex-col justify-center items-center text-neutral-400">
                        <p class="font-black text-xl">NO EVENTS YET</p>
                    </div>
                }
            </div>

            <!-- Feedback Distribution -->
            <div class="bg-white border-4 border-black shadow-[8px_8px_0px_#000] p-8 flex flex-col gap-4">
                <h3 class="text-2xl font-black border-b-4 border-black pb-2 flex items-center gap-2">
                    <span class="text-3xl">📊</span> RATING ANALYSIS
                </h3>
                <div class="flex-1 flex flex-col justify-center gap-3">
                    @for (rating of [5,4,3,2,1]; track rating) {
                        <div class="flex items-center gap-4">
                            <span class="font-black w-8">{{ rating }} ⭐</span>
                            <div class="flex-1 h-6 bg-neutral-200 border-2 border-black flex overflow-hidden">
                                <div class="bg-[#fde68a] h-full" [style.width]="getRatingPercentage(rating) + '%'"></div>
                            </div>
                            <span class="font-bold w-8 text-right">{{ analytics()?.ratingDistribution?.[rating] || 0 }}</span>
                        </div>
                    }
                </div>
            </div>
            
        </div>

    } @else {
        <div class="text-center mt-12 bg-[#fecaca] border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
            <h2 class="text-2xl font-black">FAILED TO LOAD DASHBOARD</h2>
            <p class="font-bold">Please try again later.</p>
        </div>
    }

  </div>
</div>
  `,
  styles: [`
    .stat-card {
      border: 4px solid black;
      padding: 1.5rem;
      box-shadow: 8px 8px 0px #000;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .stat-card:hover {
      transform: translate(2px, 2px);
      box-shadow: 4px 4px 0px #000;
    }
  `]
})
export class CollegeAdminDashboardComponent implements OnInit {

  private analyticsService = inject(AnalyticsService);
  private tokenService = inject(TokenService);

  loading = signal(true);
  analytics = signal<any>(null);
  collegeName = signal<string>("Unknown College");

  ngOnInit() {
    const user = this.tokenService.getUser();
    if (user?.collegeName) {
        this.collegeName.set(user.collegeName);
    }
    
    this.analyticsService.getPlatformAnalytics().subscribe({
      next: (res) => {
        this.analytics.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getRatingPercentage(rating: number): number {
      const data = this.analytics();
      if (!data || !data.totalFeedbacks || data.totalFeedbacks === 0) return 0;
      const count = data.ratingDistribution?.[rating] || 0;
      return (count / data.totalFeedbacks) * 100;
  }
}
