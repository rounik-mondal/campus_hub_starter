import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'CANCELLED';
  timestamp: string;
  event?: any;
  qrPayload?: string;
  team?: any;
  invitations?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/registrations`;

  registerForEvent(eventId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/event/${eventId}`, {});
  }

  getMyRegistrations(): Observable<{ count: number, registrations: Registration[] }> {
    return this.http.get<{ count: number, registrations: Registration[] }>(`${this.apiUrl}/me`);
  }

  cancelRegistration(registrationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cancel/${registrationId}`, {});
  }

  getEventParticipants(eventId: string): Observable<{ count: number, participants: any[] }> {
    return this.http.get<{ count: number, participants: any[] }>(`${this.apiUrl}/event/${eventId}/participants`);
  }

  updateRegistrationStatus(registrationId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${registrationId}/status`, { status });
  }
}
