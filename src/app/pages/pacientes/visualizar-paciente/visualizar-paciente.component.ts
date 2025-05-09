import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService, Paciente } from '../../../services/paciente.service';
import { AtendimentoService, Atendimento } from '../../../services/atendimento.service';

@Component({
  selector: 'app-visualizar-paciente',
  templateUrl: './visualizar-paciente.component.html',
  styleUrl: './visualizar-paciente.component.scss'
})
export class VisualizarPacienteComponent implements OnInit {
  paciente: Paciente | undefined;
  mostrarEndereco = false;

  atendimentos: Atendimento[] = [];
  atendimentosExpandido: { [id: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService,
    private atendimentoService: AtendimentoService
  ) {}

  ngOnInit(): void {
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
  }

}