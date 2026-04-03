import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin-logs`;

  getAdminLogs(filters?: { collegeId?: string; startDate?: string; endDate?: string }) {
    let params = new HttpParams();
    if (filters?.collegeId) params = params.set('collegeId', filters.collegeId);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
