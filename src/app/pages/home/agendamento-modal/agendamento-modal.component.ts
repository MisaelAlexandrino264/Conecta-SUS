import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';
import { PacienteService, Paciente } from '../../../services/paciente.service';

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

  pacientesFiltrados: Paciente[] = [];  

  constructor(
    public dialogRef: MatDialogRef<AgendamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataSelecionada: Date, agendamento?: Agendamento },
    private agendamentoService: AgendamentoService,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    if (this.data.agendamento) {
      this.hora = this.data.agendamento.hora;
      this.nome = this.data.agendamento.nome;
      this.idade = this.data.agendamento.idade;
      this.id = this.data.agendamento.id;
    }
  }

  buscarPacientes(nome: string): void {
    if (nome.length < 2) {  
      this.pacientesFiltrados = [];
      return;
    }

    this.pacienteService.buscarPacientePorNome(nome).subscribe(pacientes => {
      this.pacientesFiltrados = pacientes;
    });
  }

  selecionarPaciente(option: any): void {
    const pacienteSelecionado = this.pacientesFiltrados.find(p => p.nome === option.value);
  
    if (pacienteSelecionado) {
      this.nome = pacienteSelecionado.nome;
      this.idade = this.calcularIdade(pacienteSelecionado.dataNascimento); // Calcula a idade com base na data de nascimento
    } else {
      this.nome = ''; // Limpa o nome caso o paciente não seja encontrado
      this.idade = null;
    }
  }
  
  
  

  calcularIdade(dataNascimento: string): number {
    const nascimento = new Date(dataNascimento);
    const idadeDifMs = Date.now() - nascimento.getTime();
    const idadeData = new Date(idadeDifMs); 
    return Math.abs(idadeData.getUTCFullYear() - 1970);
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    // Verifica se o nome digitado corresponde a um paciente da lista filtrada
    const pacienteValido = this.pacientesFiltrados.find(p => p.nome === this.nome);
  
    if (!pacienteValido) {
      alert("Selecione um paciente válido da lista!");
      return;
    }
  
    // Calcula a idade do paciente válido
    this.idade = this.calcularIdade(pacienteValido.dataNascimento);
  
    // Agora sim, verifica os campos obrigatórios
    if (!this.hora || !this.nome || this.idade === null) {
      alert("Preencha todos os campos!");
      return;
    }
  
    const agendamento: Agendamento = {
      data: this.data.dataSelecionada.toISOString().split('T')[0],
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
  
  

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const nome = inputElement.value;
    this.buscarPacientes(nome);
  }
  
}
