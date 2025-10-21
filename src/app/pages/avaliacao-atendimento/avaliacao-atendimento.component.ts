import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendamentoService, Agendamento } from '../../services/agendamento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-avaliacao-atendimento',
  templateUrl: './avaliacao-atendimento.component.html',
  styleUrls: ['./avaliacao-atendimento.component.scss']
})
export class AvaliacaoAtendimentoComponent implements OnInit {
  atendimento: Agendamento | undefined;
  observacaoProfessor = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agendamentoService: AgendamentoService
  ) {}

  ngOnInit(): void {
    const atendimentoId = this.route.snapshot.paramMap.get('id');
    if (atendimentoId) {
      this.agendamentoService.getAtendimentoById(atendimentoId).subscribe(atendimento => {
        if (atendimento) {
          this.atendimento = atendimento;
          this.observacaoProfessor = atendimento.observacaoProfessor || '';
        } else {
          console.error("Nenhum atendimento encontrado com o ID:", atendimentoId);
          Swal.fire('Erro', 'Atendimento não encontrado.', 'error');
          this.router.navigate(['/home']);
        }
      });
    }
  }

  async salvarAvaliacao(novoStatus: 'aceito' | 'rejeitado') {
    if (!this.atendimento?.id || !this.atendimento.agendamentoId) {
      Swal.fire('Erro Crítico', 'Não foi possível identificar o agendamento original para finalizar a avaliação.', 'error');
      return;
    }
    
    console.log(`Tentando avaliar e finalizar. Atendimento ID: ${this.atendimento.id}, Agendamento Original ID: ${this.atendimento.agendamentoId}`);

    try {
      await this.agendamentoService.avaliarEFinalizar(
        this.atendimento.id,
        this.atendimento.agendamentoId,
        novoStatus,
        this.observacaoProfessor
      ).then(() => {
        console.log('SUCESSO: Avaliação salva e status sincronizado no AGENDAMENTO original.');
      })
      .catch(err => {
        console.error('FALHA ao avaliar e sincronizar status:', err);
      });
      
      Swal.fire('Sucesso!', 'Avaliação salva com sucesso.', 'success');
      this.router.navigate(['/home']);

    } catch (error) {
      console.error("ERRO CRÍTICO na avaliação:", error);
      Swal.fire('Erro!', 'Não foi possível salvar a avaliação.', 'error');
    }
  }

  cancelar(): void {
    this.router.navigate(['/home']);
  }
}