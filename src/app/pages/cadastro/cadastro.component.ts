import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class CadastroComponent implements OnInit {
  cadastroForm: FormGroup;
  senhaInvalida: boolean = false;
  formInvalido: boolean = false;
  isEditMode = false;
  userId: string | null = null;
  pageTitle = 'Cadastro de Usuário'; // Título dinâmico da página

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.cadastroForm = this.fb.group({}); 
  }

  ngOnInit(): void {
    this.buildForm();
    this.checkRouteForContext();
  }

  private buildForm(): void {
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
  }

  private checkRouteForContext(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    const contexto = this.route.snapshot.queryParamMap.get('contexto');

    if (contexto === 'estagiario') {
      // Se for o contexto de estagiário, adapta a página
      this.pageTitle = this.isEditMode ? 'Dados do Estagiário' : 'Cadastrar Estagiário';
      this.cadastroForm.get('tipo')?.setValue('Estagiário');
      this.cadastroForm.get('tipo')?.disable();
    }

    if (this.isEditMode && this.userId) {
      this.authService.getUsuarioLogado().then(usuario => { 
          if (usuario) { 
              this.cadastroForm.patchValue(usuario);
              this.cadastroForm.get('email')?.disable(); 
              this.cadastroForm.get('password')?.disable(); 
              this.cadastroForm.get('confirmPassword')?.disable();
          }
      });
    }
  }

  verificarSenha() {
    if (this.isEditMode) return;
  
    const password = this.cadastroForm.get('password')?.value;
    const confirmPassword = this.cadastroForm.get('confirmPassword')?.value;
  
    if (!confirmPassword) {
      this.senhaInvalida = true;
      this.cadastroForm.get('confirmPassword')?.setErrors({ required: true });
      return;
    }
  
    this.senhaInvalida = password !== confirmPassword;
  
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
      if (this.isEditMode && this.userId) {
        await this.authService.atualizarUsuario(this.userId, nome, this.cadastroForm.get('tipo')?.value, departamento);
         Swal.fire({
              icon: 'success',
              title: 'Sucesso!',
              text: 'Usuário atualizado com sucesso!',
              confirmButtonColor: '#0d47a1'
          });
      } else {
        await this.authService.registerInterno(email, password, departamento, nome, this.cadastroForm.get('tipo')?.value);
      }

    
      if (this.route.snapshot.queryParamMap.get('contexto') === 'estagiario') {
          this.router.navigate(['/estagiarios']);
      } else {
          this.router.navigate(['/usuarios']);
      }
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
        if (this.route.snapshot.queryParamMap.get('contexto') === 'estagiario') {
            this.router.navigate(['/estagiarios']);
        } else {
            this.router.navigate(['/usuarios']);
        }
      }
    });
  }
}