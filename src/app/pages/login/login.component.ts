import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AuthService } from './service/auth.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';


import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, 
    FormsModule, 
    ButtonModule, 
    InputTextModule, 
    ReactiveFormsModule,
    PasswordModule, 
    CheckboxModule,
    DividerModule,
    FloatLabelModule,
    ToastModule,
    CardModule
  ],
 templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private toast = inject(MessageService);

  loading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true]
  });

  get emailInvalid() {
    const c = this.form.controls.email;
    return c.touched && c.invalid;
  }

  get passwordInvalid() {
    const c = this.form.controls.password;
    return c.touched && c.invalid;
  }

  onSubmit() {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Login efetuado!' });
        this.router.navigateByUrl('/');
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.toast.add({ severity: 'error', summary: 'Ops', detail: err.message });
      }
    });

  }


}
