import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgendamentoModalComponent } from '../home/agendamento-modal/agendamento-modal.component';
import { Agendamento, AgendamentoService } from '../../services/agendamento.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  tipoUsuario: string | null = null;
  selected: Date | null = null;
  agendamentos: Agendamento[] = []; 
  hoje = new Date(); 
  constructor(
    public dialog: MatDialog,
    private agendamentoService: AgendamentoService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.tipoUsuario = this.authService.getTipoUsuarioLocal();
    console.log('Tipo do usuário (local):', this.tipoUsuario);
  
    if (!this.tipoUsuario) {
      this.authService.getTipoUsuario().then(tipo => {
        this.tipoUsuario = tipo;
        console.log('Tipo carregado do Firestore:', tipo);
      });
    }
  
    if (this.selected) {
      this.buscarAgendamentos(this.selected);
    }
  }
  

  // Buscar agendamentos de acordo com a data selecionada
  buscarAgendamentos(data: Date | null): void {
    if (data) {
      this.agendamentoService.obterMeusAgendamentosPorData(data).subscribe((agendamentos) => {
        this.agendamentos = agendamentos.sort((a, b) => {
          return a.hora.localeCompare(b.hora); 
        });
      });
    }
  }

  iniciarAtendimento(agendamento: Agendamento): void {
    this.router.navigate(['/atendimento'], { queryParams: { 
      id: agendamento.id, 
      nome: agendamento.nome, 
      idade: agendamento.idade,
      data: agendamento.data 
    }});
  }
  

  abrirModalAgendamento(agendamento?: Agendamento): void {
    if (!this.selected && !agendamento) {
      alert('Selecione uma data no calendário antes de agendar!');
      return;
    }
  
    const dialogRef = this.dialog.open(AgendamentoModalComponent, {
      width: '400px',
      data: { 
        dataSelecionada: this.selected, 
        agendamento: agendamento || null ,
        autoFocus: false 
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Agendamento recebido na home:', result);
        this.buscarAgendamentos(this.selected);
      }
    });
  }
  

  // Função para verificar o ID antes de tentar excluir
  verificarIdEExcluir(id: string | undefined): void {
    if (!id) {
      console.error('Erro: ID do agendamento está indefinido!');
      return;
    }
  
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.excluirAgendamento(id);
        Swal.fire(
          'Excluído!',
          'O agendamento foi removido com sucesso.',
          'success'
        );
      }
    });
  }
  
  

  excluirAgendamento(id: string): void {
    if (!id) {
      console.error('Erro: ID do agendamento está indefinido!');
      return;
    }
  
    this.agendamentoService.excluirAgendamento(id)
      .then(() => {
        console.log('Agendamento excluído com sucesso!');
        this.buscarAgendamentos(this.selected); 
      })
      .catch((error) => {
        console.error('Erro ao excluir agendamento:', error);
      });
  }

  filtroDatas = (d: Date | null): boolean => {
    if (!d) return false;
    const dataSemHoras = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const hojeSemHoras = new Date(this.hoje.getFullYear(), this.hoje.getMonth(), this.hoje.getDate());
  
    return dataSemHoras >= hojeSemHoras;
  };
  
}
