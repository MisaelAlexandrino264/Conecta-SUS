import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService, Paciente } from '../../../services/paciente.service';
import { AtendimentoService, Atendimento } from '../../../services/atendimento.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visualizar-paciente',
  templateUrl: './visualizar-paciente.component.html',
  styleUrls: ['./visualizar-paciente.component.scss']
})
export class VisualizarPacienteComponent implements OnInit {
  paciente: Paciente | undefined;
  mostrarEndereco = false;
  tipoUsuario: string | null = null;
  atendimentos: Atendimento[] = [];
  atendimentosExpandido: { [id: string]: boolean } = {};
  observacoes: { [id: string]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private atendimentoService: AtendimentoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getTipoUsuario().then(tipo => {
      this.tipoUsuario = tipo;
    });
    
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.pacienteService.obterPacientePorId(id).subscribe(p => {
          this.paciente = p;
        });
        this.carregarAtendimentos(id);
      }
    });
  }

  toggleEndereco(): void {
    this.mostrarEndereco = !this.mostrarEndereco;
  }

  toggleAtendimento(id: string): void {
    this.atendimentosExpandido[id] = !this.atendimentosExpandido[id];
  }

  async carregarAtendimentos(pacienteId: string): Promise<void> {
    this.atendimentos = await this.atendimentoService.obterAtendimentosPorPaciente(pacienteId);
    // Inicializa as observações com os valores existentes
    this.atendimentos.forEach(at => {
      if (at.id) {
        this.observacoes[at.id] = at.observacaoProfessor || '';
      }
    });
  }

  // --- NOVO MÉTODO ---
  // Chamado pelos botões de Aceitar/Rejeitar
  async salvarAvaliacao(atendimento: Atendimento, novoStatus: 'aceito' | 'rejeitado') {
    if (!atendimento.id) return;

    const observacao = this.observacoes[atendimento.id];

    try {
      await this.atendimentoService.avaliarAtendimento(atendimento.id, novoStatus, observacao);
      
      atendimento.status = novoStatus;
      atendimento.observacaoProfessor = observacao;

      Swal.fire('Sucesso!', 'Avaliação salva com sucesso.', 'success');
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      Swal.fire('Erro!', 'Não foi possível salvar a avaliação.', 'error');
    }
  }
}