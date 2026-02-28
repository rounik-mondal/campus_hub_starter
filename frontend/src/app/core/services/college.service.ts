import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

/**  Types (exported for components) */
export interface College {
  id: string;
  name: string;
}

export interface GetCollegesResponse {
  colleges: College[];
}

@Injectable({ providedIn: 'root' })
export class CollegeService {
  private baseUrl = `${environment.apiUrl}/colleges`;

  constructor(private http: HttpClient) {}

  /** typed */
  getColleges(): Observable<GetCollegesResponse> {
    return this.http.get<GetCollegesResponse>(this.baseUrl);
  }

  createCollege(data: any) {
    return this.http.post(this.baseUrl, data);
  }

  createCollegeAdmin(data: any) {
    return this.http.post(`${this.baseUrl}/create-admin`, data);
  }
}