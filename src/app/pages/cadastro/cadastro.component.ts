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
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    // Monitorando mudanças nos campos de senha
    this.cadastroForm.get('password')?.valueChanges.subscribe(() => {
      this.verificarSenha();
    });

    this.cadastroForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.verificarSenha();
    });
  }

  verificarSenha() {
    const password = this.cadastroForm.get('password')?.value;
    const confirmPassword = this.cadastroForm.get('confirmPassword')?.value;

    // Verifica se as senhas não coincidem e se confirmPassword não está vazio
    this.senhaInvalida = password !== confirmPassword && confirmPassword !== '';

    // Atualiza a validade do campo confirmPassword para refletir a verificação
    if (this.senhaInvalida) {
      this.cadastroForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.cadastroForm.get('confirmPassword')?.setErrors(null); // limpa o erro caso as senhas coincidam
    }
  }

  onSubmit() {
    this.formInvalido = this.cadastroForm.invalid || this.senhaInvalida;

    if (this.formInvalido) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const { email, password, departamento, nome } = this.cadastroForm.value;
    this.authService.register(email, password, departamento, nome);
  }
}
