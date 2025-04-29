import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent {
  cadastroForm: FormGroup;
  senhaInvalida: boolean = false;
  formInvalido: boolean = false;
  editando = false;
  uidEditando: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cadastroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nome: ['', Validators.required],
      departamento: ['', Validators.required],
      tipo: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.cadastroForm.get('password')?.valueChanges.subscribe(() => this.verificarSenha());
    this.cadastroForm.get('confirmPassword')?.valueChanges.subscribe(() => this.verificarSenha());

    // Verifica se está editando um usuário
    const usuario = history.state.usuario;
    if (usuario) {
      this.editando = true;
      this.uidEditando = usuario.uid;

      this.cadastroForm.patchValue({
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        departamento: usuario.departamento
      });

      this.cadastroForm.get('email')?.disable(); // Impede edição do e-mail
      this.cadastroForm.get('password')?.disable(); // Senha não será atualizada aqui
      this.cadastroForm.get('confirmPassword')?.disable();
    }
  }

  verificarSenha() {
    if (this.editando) return;

    const password = this.cadastroForm.get('password')?.value;
    const confirmPassword = this.cadastroForm.get('confirmPassword')?.value;

    this.senhaInvalida = password !== confirmPassword && confirmPassword !== '';

    if (this.senhaInvalida) {
      this.cadastroForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.cadastroForm.get('confirmPassword')?.setErrors(null);
    }
  }

  async onSubmit() {
    this.formInvalido = this.cadastroForm.invalid || this.senhaInvalida;

    if (this.formInvalido) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const { email, password, departamento, nome, tipo } = this.cadastroForm.getRawValue();

    try {
      if (this.editando && this.uidEditando) {
        await this.authService.atualizarUsuario(this.uidEditando, nome, tipo, departamento);
         Swal.fire({
              icon: 'success',
              title: 'Sucesso!',
              text: 'Usuário atualizado com sucesso!',
              confirmButtonColor: '#0d47a1'
          });
      } else {
        await this.authService.registerInterno(email, password, departamento, nome, tipo);
      }

      this.router.navigate(['/usuarios']);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  }

  cancelar() {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Todas as informações preenchidas serão perdidas!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, cancelar',
      cancelButtonText: 'Continuar preenchendo'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/usuarios']);
      }
    });
  }
  
}
