import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  senhaInvalida: boolean = false;
  formInvalido: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.cadastroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      departamento: ['', Validators.required],
      tipo: ['', Validators.required],  // Adicionado aqui
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.cadastroForm.get('password')?.valueChanges.subscribe(() => this.verificarSenha());
    this.cadastroForm.get('confirmPassword')?.valueChanges.subscribe(() => this.verificarSenha());
  }

  verificarSenha() {
    const password = this.cadastroForm.get('password')?.value;
    const confirmPassword = this.cadastroForm.get('confirmPassword')?.value;

    this.senhaInvalida = password !== confirmPassword && confirmPassword !== '';

    if (this.senhaInvalida) {
      this.cadastroForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.cadastroForm.get('confirmPassword')?.setErrors(null); 
    }
  }

  onSubmit() {
    this.formInvalido = this.cadastroForm.invalid || this.senhaInvalida;

    if (this.formInvalido) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const { email, password, departamento, nome, tipo } = this.cadastroForm.value; // Adicionado `tipo`
    this.authService.register(email, password, departamento, nome, tipo); // Adicionado `tipo`
  }
}
