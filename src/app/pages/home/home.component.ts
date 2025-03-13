import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgendamentoModalComponent } from '../home/agendamento-modal/agendamento-modal.component';
import { Agendamento, AgendamentoService } from '../../services/agendamento.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selected: Date | null = null;
  agendamentos: Agendamento[] = []; // Variável para armazenar os agendamentos

  constructor(
    public dialog: MatDialog,
    private agendamentoService: AgendamentoService, // Injetando o serviço
    private router: Router
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
        this.agendamentos = agendamentos.sort((a, b) => {
          return a.hora.localeCompare(b.hora); // Ordena por horário (ordem crescente)
        });
      });
    }
  }

  iniciarAtendimento(agendamento: any): void {
    this.router.navigate(['/atendimento'], { queryParams: { id: agendamento.id } });
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

  // Função para verificar o ID antes de tentar excluir
  verificarIdEExcluir(id: string | undefined): void {
    console.log('ID do agendamento:', id);
    if (id) {
      this.excluirAgendamento(id);
    } else {
      console.error('Erro: ID do agendamento está indefinido!');
    }
  }

  excluirAgendamento(id: string): void {
    if (!id) {
      console.error('Erro: ID do agendamento está indefinido!');
      return;
    }
  
    this.agendamentoService.excluirAgendamento(id)
      .then(() => {
        console.log('Agendamento excluído com sucesso!');
        this.buscarAgendamentos(this.selected); // Recarrega os agendamentos após exclusão
      })
      .catch((error) => {
        console.error('Erro ao excluir agendamento:', error);
      });
  }
  
}
