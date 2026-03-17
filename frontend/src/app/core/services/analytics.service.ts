import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlatformAnalytics {
  totalColleges: number;
  totalAdmins: number;
  totalStudents: number;
  totalEvents: number;
  totalRegistrations: number;
  roleDistribution: { role: string; count: number }[];
  eventsPerCollege: { collegeId: string; count: number }[];
  registrationsPerEvent: { eventId: string; count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  getPlatformAnalytics(): Observable<PlatformAnalytics> {
    return this.http.get<PlatformAnalytics>(`${this.apiUrl}/platform`);
  }
}
