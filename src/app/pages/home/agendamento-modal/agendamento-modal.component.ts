import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';

@Component({
  selector: 'app-agendamento-modal',
  templateUrl: './agendamento-modal.component.html',
  styleUrls: ['./agendamento-modal.component.scss']
})
export class AgendamentoModalComponent {
  hora: string = '';
  nome: string = '';
  idade: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<AgendamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataSelecionada: Date },
    private agendamentoService: AgendamentoService
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    if (!this.hora || !this.nome || !this.idade) {
      alert("Preencha todos os campos!");
      return;
    }

    const agendamento: Agendamento = {
      data: this.data.dataSelecionada.toISOString().split('T')[0], // Salva apenas a data no formato YYYY-MM-DD
      hora: this.hora,
      nome: this.nome,
      idade: this.idade
    };

    this.agendamentoService.salvarAgendamento(agendamento)
      .then(() => {
        alert("Agendamento salvo com sucesso!");
        this.dialogRef.close(agendamento);
      })
      .catch(error => {
        alert("Erro ao salvar o agendamento!");
        console.error(error);
      });
  }
}
