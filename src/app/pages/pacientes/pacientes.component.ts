import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CadastroPacienteComponent } from '../pacientes/cadastro-paciente/cadastro-paciente.component';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent {
  constructor(public dialog: MatDialog) {}

  abrirCadastroPaciente() {
    this.dialog.open(CadastroPacienteComponent, {
      panelClass: 'modal-container'
    });
  }
}
  