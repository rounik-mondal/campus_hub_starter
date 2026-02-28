import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventListResponse } from '../../models/event.model';


@Injectable({ providedIn: 'root' })
export class EventService {
    private baseUrl = `${environment.apiUrl}/events`;

    constructor(private http: HttpClient) { }

    getEvents() {
        return this.http.get<EventListResponse>(this.baseUrl);
    }

    createEvent(data: {
        title: string;
        description: string;
        category: string;
        location: string;
        scope: 'GLOBAL' | 'COLLEGE';
        startDate: string;
        endDate: string;
    }) {
        return this.http.post(`${this.baseUrl}`, data);
    }

    getEventById(id: string) {
        return this.http.get(`${this.baseUrl}/${id}`);
    }
}

