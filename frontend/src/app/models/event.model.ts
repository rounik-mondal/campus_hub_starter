export interface College {
  id: string;
  name: string;
}

export interface EventItem {
  id: string;
  collegeId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  scope: 'GLOBAL' | 'COLLEGE';
  startDate: string;
  endDate: string;
  createdAt: string;
  college?: College;
  maxSeats: number;
  isPaid: boolean;
  ticketPrice: number;
  isTeamEvent: boolean;
  maxTeamSize: number;
  _count?: {
    registrations: number;
  };
  registrations?: { id: string; status: string }[];
}

export interface EventListResponse {
  count: number;
  events: EventItem[];
}