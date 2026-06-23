import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ShortenedUrl {
	shortUrl: string;
	longUrl: string;
	creationDate: string;
}

@Injectable({ providedIn: 'root' })
export class UrlService {
	private readonly http = inject(HttpClient);
	private readonly baseUrl = 'http://localhost:5000/url';

	list(): Observable<ShortenedUrl[]> {
		return this.http.get<ShortenedUrl[]>(`${this.baseUrl}/list`);
	}

	shorten(longUrl: string): Observable<ShortenedUrl[]> {
		return this.http.post<ShortenedUrl[]>(`${this.baseUrl}/shorten`, { url: longUrl });
	}

	delete(longUrl: string): Observable<ShortenedUrl[]> {
		return this.http.delete<ShortenedUrl[]>(`${this.baseUrl}/delete`, { body: { longUrl } });
	}
}
