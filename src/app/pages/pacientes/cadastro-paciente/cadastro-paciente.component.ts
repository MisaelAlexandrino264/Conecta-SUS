import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-cadastro-paciente',
  templateUrl: './cadastro-paciente.component.html',
  styleUrls: ['./cadastro-paciente.component.scss']
})
export class CadastroPacienteComponent {
  constructor(public dialogRef: MatDialogRef<CadastroPacienteComponent>) {}

  fechar() {
    this.dialogRef.close();
  }
}
