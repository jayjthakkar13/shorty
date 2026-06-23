import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";

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

	submit() {}

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
}
