import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  // Subject para gerenciar o ciclo de vida das inscrições
  private destroy$ = new Subject<void>();
  tipoUsuario: string | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Escuta as informações do usuário logado a partir do AuthService
    this.authService.usuarioLogado$.pipe(
      takeUntil(this.destroy$) // Garante que a inscrição será finalizada ao sair
    ).subscribe(usuario => {
      if (usuario) {
        this.tipoUsuario = usuario.tipo;
      } else {
        this.tipoUsuario = null;
      }
    });
  }

  // Método chamado quando o componente é destruído (ex: ao deslogar)
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();  
  }
}