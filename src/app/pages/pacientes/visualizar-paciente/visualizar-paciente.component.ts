import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PacienteService, Paciente } from '../../../services/paciente.service';

@Component({
  selector: 'app-visualizar-paciente',
  templateUrl: './visualizar-paciente.component.html',
  styleUrl: './visualizar-paciente.component.scss'
})
export class VisualizarPacienteComponent implements OnInit {
  paciente: Paciente | undefined;
  mostrarEndereco = false;

  constructor(
    private route: ActivatedRoute,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.pacienteService.obterPacientePorId(id).subscribe(p => {
          this.paciente = p;
        });
      }
    });
  }

  toggleEndereco(): void {
    this.mostrarEndereco = !this.mostrarEndereco;
  }
}