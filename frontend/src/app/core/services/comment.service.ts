import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CommentNode {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  timestamp: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  replies?: CommentNode[];
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  getEventComments(eventId: string): Observable<{ comments: CommentNode[] }> {
    return this.http.get<{ comments: CommentNode[] }>(`${this.apiUrl}/event/${eventId}`);
  }

  postComment(eventId: string, content: string, parentId?: string): Observable<any> {
    const payload: any = { eventId, content };
    if (parentId) payload.parentId = parentId;
    return this.http.post(this.apiUrl, payload);
  }
}
