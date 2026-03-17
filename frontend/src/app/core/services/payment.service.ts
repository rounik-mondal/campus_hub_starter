import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentSimulationResponse {
  message: string;
  transactionId: string;
  status: string;
  amountPaid: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  simulatePayment(eventId: string, amount?: number): Observable<PaymentSimulationResponse> {
    const payload = amount ? { eventId, amount } : { eventId };
    return this.http.post<PaymentSimulationResponse>(`${this.apiUrl}/simulate`, payload);
  }
}
