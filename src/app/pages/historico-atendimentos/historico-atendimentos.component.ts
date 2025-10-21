import { Component, OnInit, OnDestroy } from '@angular/core';
import { Agendamento, AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-historico-atendimentos',
  templateUrl: './historico-atendimentos.component.html',
  styleUrls: ['./historico-atendimentos.component.scss']
})
export class HistoricoAtendimentosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  atendimentos: Agendamento[] = [];
  tituloPagina = 'Histórico de Atendimentos';

  constructor(
    private agendamentoService: AgendamentoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.usuarioLogado$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(usuario => {
      if (!usuario) return;

      if (usuario.tipo === 'Estagiário') {
        this.tituloPagina = 'Meus Atendimentos Avaliados';
        this.agendamentoService.obterAtendimentosAvaliadosPorEstagiario(usuario.uid)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.atendimentos = data.sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime());
          });
      } else if (usuario.tipo === 'Professor') {
        this.tituloPagina = 'Atendimentos que Avaliei';
        this.agendamentoService.obterAtendimentosAvaliadosPorProfessor(usuario.uid)
          .pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.atendimentos = data.sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime());
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}