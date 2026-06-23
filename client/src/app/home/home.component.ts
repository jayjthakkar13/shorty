import { Component, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ShortenedUrl } from "./home.service";

@Component({
  selector: "app-home",
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  private readonly fb = inject(FormBuilder);

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

  submit() {}

  deleteUrl(longUrl: string) {}

  copy(shortUrl: string) {}

  shortCodeFor(shortUrl: string) {}

  logout() {}
}
