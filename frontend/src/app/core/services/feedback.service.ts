import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/feedbacks`;

  createFeedback(eventId: string, rating: number, comments: string) {
    return this.http.post<any>(this.apiUrl, { eventId, rating, comments });
  }

  getEventFeedbacks(eventId: string) {
    return this.http.get<any>(`${this.apiUrl}/event/${eventId}`);
  }
}
