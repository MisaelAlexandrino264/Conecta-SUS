import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService, Paciente } from '../../../services/paciente.service';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-visualizar-paciente',
  templateUrl: './visualizar-paciente.component.html',
  styleUrls: ['./visualizar-paciente.component.scss']
})
export class VisualizarPacienteComponent implements OnInit {
  paciente: Paciente | undefined;
  mostrarEndereco = false;
  tipoUsuario: string | null = null;
  atendimentos: Agendamento[] = [];
  atendimentosExpandido: { [id: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private agendamentoService: AgendamentoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getTipoUsuario().then(tipo => {
      this.tipoUsuario = tipo;
      
      this.route.queryParams.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.pacienteService.obterPacientePorId(id).subscribe(p => this.paciente = p);
          this.carregarAtendimentos(id);
        }
      });
    });
  }

  toggleEndereco(): void { this.mostrarEndereco = !this.mostrarEndereco; }

  toggleAtendimento(id: string): void { this.atendimentosExpandido[id] = !this.atendimentosExpandido[id]; }

  async carregarAtendimentos(pacienteId: string): Promise<void> {
    const todosOsAtendimentos = await this.agendamentoService.obterAtendimentosPorPaciente(pacienteId);

    // Filtra a lista de atendimentos baseado no tipo de usuário
    if (this.tipoUsuario === 'Professor') {
      // Professor vê todos os atendimentos para poder consultar o histórico completo
      this.atendimentos = todosOsAtendimentos;
    } else {
      // Outros usuários (Secretaria, Estagiário) veem apenas os que foram aceitos
      this.atendimentos = todosOsAtendimentos.filter((at: Agendamento) => at.status === 'aceito');
    }

    // Ordena os atendimentos por data (mais recentes primeiro)
    this.atendimentos.sort((a, b) => new Date(b.data as string).getTime() - new Date(a.data as string).getTime());
  }

  // O MÉTODO salvarAvaliacao FOI REMOVIDO DAQUI
}
