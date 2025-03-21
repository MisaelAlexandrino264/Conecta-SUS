import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';

@Component({
  selector: 'app-agendamento-modal',
  templateUrl: './agendamento-modal.component.html',
  styleUrls: ['./agendamento-modal.component.scss']
})
export class AgendamentoModalComponent implements OnInit {
  hora: string = '';
  nome: string = '';
  idade: number | null = null;
  id?: string; 

  constructor(
    public dialogRef: MatDialogRef<AgendamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataSelecionada: Date, agendamento?: Agendamento },
    private agendamentoService: AgendamentoService
  ) {}

  ngOnInit(): void {
    if (this.data.agendamento) {
      this.hora = this.data.agendamento.hora;
      this.nome = this.data.agendamento.nome;
      this.idade = this.data.agendamento.idade;
      this.id = this.data.agendamento.id;
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    if (!this.hora || !this.nome || this.idade === null) {
      alert("Preencha todos os campos!");
      return;
    }
  
    const agendamento: Agendamento = {
      data: this.data.dataSelecionada.toISOString().split('T')[0], // Formato 'YYYY-MM-DD'
      hora: this.hora,
      nome: this.nome,
      idade: this.idade
    };
  
    if (this.id) {
      agendamento.id = this.id;  
      this.agendamentoService.atualizarAgendamento(agendamento)
        .then(() => {
          alert("Agendamento atualizado com sucesso!");
          this.dialogRef.close(agendamento);
        })
        .catch(error => {
          alert("Erro ao atualizar o agendamento!");
          console.error(error);
        });
    } else {
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
  
}
