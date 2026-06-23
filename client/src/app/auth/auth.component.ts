import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";

type Mode = 'login' | 'register';

function passwordComplexity(control: AbstractControl): ValidationErrors | null {
	const v = control.value as string;
	if (!v) return null;
	const errors: ValidationErrors = {};
	if (!/[a-z]/.test(v)) errors['lowercase'] = true;
	if (!/[A-Z]/.test(v)) errors['uppercase'] = true;
	if (!/\d/.test(v)) errors['digit'] = true;
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) errors['symbol'] = true;
	return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: "app-auth",
  imports: [ReactiveFormsModule],
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.css",
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
	private readonly router = inject(Router);

	readonly mode = signal<Mode>('login');
	readonly submitting = signal(false);
	readonly serverError = signal<string | null>(null);

	readonly form = this.fb.nonNullable.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(32)]]
	});

	toggleMode(): void {
    this.mode.update(m => (m === 'login' ? 'register' : 'login'));
		this.serverError.set(null);
		this.applyPasswordValidators();
  }

	submit(): void {
    if (this.form.invalid || this.submitting()) {
			this.form.markAllAsTouched();
			return;
		}

		const { email, password } = this.form.getRawValue();
		this.submitting.set(true);
		this.serverError.set(null);

		const request = this.mode() === 'login'
			? this.auth.login(email, password)
			: this.auth.register(email, password);

		request.subscribe({
			next: () => {
				this.submitting.set(false);
				this.router.navigateByUrl('/home');
			},
			error: (err: HttpErrorResponse) => {
				this.serverError.set(this.formatError(err));
				this.submitting.set(false);
			}
		});
  }

  private applyPasswordValidators(): void {
		const password = this.form.controls.password;
		const validators = [
			Validators.required,
			Validators.minLength(8),
			Validators.maxLength(32)
		];
		if (this.mode() === 'register') validators.push(passwordComplexity);
		password.setValidators(validators);
		password.updateValueAndValidity({ emitEvent: false });
	}

  private formatError(err: HttpErrorResponse): string {
		if (err.status === 0) return 'Could not reach the server. Is the API running on http://localhost:5000?';
		const body = err.error;
		if (typeof body === 'string') return body;
		if (body && typeof body === 'object') {
			if (typeof body.text === 'string' && body.text.length) return body.text;
			if (Array.isArray(body.errors) && body.errors.length) return body.errors.join(' ');
			if (typeof body.message === 'string') return body.message;
		}
		return `Request failed (${err.status}).`;
	}
}
