import { Component, inject, OnInit, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { ShortenedUrl, UrlService } from "../services/url.service";

@Component({
  selector: "app-home",
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly urlService = inject(UrlService);

  readonly urls = signal<ShortenedUrl[]>([]);
  readonly loading = signal(true);
	readonly submitting = signal(false);
  readonly deletingUrl = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly copiedShortUrl = signal<string | null>(null);
  readonly userEmail = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
		url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]]
	});

  ngOnInit(): void {
		this.userEmail.set(localStorage.getItem('shorty.userEmail'));
		this.urlService.list().subscribe({
			next: list => {
				this.urls.set(list);
				this.loading.set(false);
			},
			error: (err: HttpErrorResponse) => {
				this.error.set(this.formatError(err));
				this.loading.set(false);
			}
		});
	}

  submit() {}

  deleteUrl(longUrl: string) {}

  copy(shortUrl: string) {}

  shortCodeFor(shortUrl: string) {}

  logout() {}

  private formatError(err: HttpErrorResponse): string {
		if (err.status === 0) return 'Could not reach the server. Is the API running on http://localhost:5000?';
		if (err.status === 401) return 'Your session has expired. Please log in again.';
		const body = err.error;
		if (typeof body === 'string') return body;
		if (body && typeof body === 'object') {
			if (typeof body.text === 'string' && body.text.length) return body.text;
			if (typeof body.error === 'string') return body.error;
			if (typeof body.message === 'string') return body.message;
		}
		return `Request failed (${err.status}).`;
	}
}
