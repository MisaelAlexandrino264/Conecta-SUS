import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgendamentoModalComponent } from '../home/agendamento-modal/agendamento-modal.component';
import { AgendamentoService } from '../../services/agendamento.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selected: Date | null = null;
  agendamentos: any[] = []; // Variável para armazenar os agendamentos

  constructor(
    public dialog: MatDialog,
    private agendamentoService: AgendamentoService // Injetando o serviço
  ) {}

  ngOnInit(): void {
    // Faz a busca quando uma data for selecionada
    if (this.selected) {
      this.buscarAgendamentos(this.selected);
    }
  }

  // Buscar agendamentos de acordo com a data selecionada
  buscarAgendamentos(data: Date | null): void {
    if (data) {
      this.agendamentoService.obterMeusAgendamentosPorData(data).subscribe((agendamentos) => {
        this.agendamentos = agendamentos; // Atualiza a lista de agendamentos
      });
    }
  }

  // Método para abrir o modal
  abrirModalAgendamento(): void {
    if (!this.selected) {
      alert('Selecione uma data no calendário antes de agendar!');
      return;
    }

    const dialogRef = this.dialog.open(AgendamentoModalComponent, {
      width: '400px',
      data: { dataSelecionada: this.selected },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Agendamento recebido na home:', result);
        this.buscarAgendamentos(this.selected); // Recarrega os agendamentos após salvar
      }
    });
  }
}