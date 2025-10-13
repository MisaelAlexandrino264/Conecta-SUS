import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';
import { PacienteService, Paciente } from '../../../services/paciente.service';
import { EstagiarioService, Estagiario } from '../../../services/estagiario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agendamento-modal',
  templateUrl: './agendamento-modal.component.html',
  styleUrls: ['./agendamento-modal.component.scss']
})
export class AgendamentoModalComponent implements OnInit {
  agendamentoForm!: FormGroup;
  pacientesFiltrados: Paciente[] = [];
  estagiariosFiltrados: Estagiario[] = [];
  idade: number | null = null;
  id?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgendamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataSelecionada: Date, agendamento?: Agendamento },
    private agendamentoService: AgendamentoService,
    private pacienteService: PacienteService,
    private estagiarioService: EstagiarioService
  ) {}

  ngOnInit(): void {
    this.agendamentoForm = this.fb.group({
      hora: ['', Validators.required],
      nome: ['', Validators.required],
      estagiarioNome: ['', Validators.required]
    });
  
    if (this.data.agendamento) {
      const { hora, nome, estagiarioNome } = this.data.agendamento;
      this.idade = this.data.agendamento.idade;
      this.id = this.data.agendamento.id;
  
      this.agendamentoForm.patchValue({ hora, nome, estagiarioNome });
  
      this.pacienteService.buscarPacientePorNome(nome).subscribe(pacientes => {
        this.pacientesFiltrados = pacientes;
  
        this.agendamentoForm.get('nome')?.setValidators([
          Validators.required,
          this.pacienteValidoValidator(this.pacientesFiltrados)
        ]);
        this.agendamentoForm.get('nome')?.updateValueAndValidity();
      });
  
      this.estagiarioService.buscarEstagiariosPorNome(estagiarioNome || '').subscribe(estagiarios => {
        this.estagiariosFiltrados = estagiarios;
  
        this.agendamentoForm.get('estagiarioNome')?.setValidators([
          Validators.required,
          this.estagiarioValidoValidator(this.estagiariosFiltrados)
        ]);
        this.agendamentoForm.get('estagiarioNome')?.updateValueAndValidity();
      });
    }
  }
  

  buscarPacientes(nome: string): void {
    if (nome.length < 2) {
      this.pacientesFiltrados = [];
      return;
    }

    this.pacienteService.buscarPacientePorNome(nome).subscribe(pacientes => {
      this.pacientesFiltrados = pacientes;

      this.agendamentoForm.get('nome')?.setValidators([
        Validators.required,
        this.pacienteValidoValidator(this.pacientesFiltrados)
      ]);
      this.agendamentoForm.get('nome')?.updateValueAndValidity();
    });
  }

  buscarEstagiarios(nome: string): void {
    if (nome.length < 2) {
      this.estagiariosFiltrados = [];
      return;
    }

    this.estagiarioService.buscarEstagiariosPorNome(nome).subscribe(estagiarios => {
      this.estagiariosFiltrados = estagiarios;

      this.agendamentoForm.get('estagiarioNome')?.setValidators([
        Validators.required,
        this.estagiarioValidoValidator(this.estagiariosFiltrados)
      ]);
      this.agendamentoForm.get('estagiarioNome')?.updateValueAndValidity();
    });
  }

  pacienteValidoValidator(pacientes: Paciente[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.value;
      return pacientes.some(p => p.nome === nome) ? null : { pacienteInvalido: true };
    };
  }

  estagiarioValidoValidator(estagiarios: Estagiario[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.value;
      return estagiarios.some(p => p.nome === nome) ? null : { estagiarioInvalido: true };
    };
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

  async salvar(): Promise<void> {
    if (this.agendamentoForm.invalid) {
      this.agendamentoForm.markAllAsTouched();
      return;
    }
  
    const { hora, nome, estagiarioNome } = this.agendamentoForm.value;
    const paciente = this.pacientesFiltrados.find(p => p.nome === nome);
    const estagiario = this.estagiariosFiltrados.find(p => p.nome === estagiarioNome);
  
    if (!paciente || !estagiario) return;
  
    this.idade = this.calcularIdade(paciente.dataNascimento);
    const dataAgendamento = this.data.dataSelecionada.toISOString().split('T')[0];
  
    const podeAgendar = await this.agendamentoService.verificarDisponibilidade(
      estagiario.uid,
      dataAgendamento,
      hora,
      this.id 
    );
  
    if (!podeAgendar) {
      Swal.fire({
        icon: 'warning',
        title: 'Erro ao agendar',
        text: 'Esse estagiario já tem um agendamento nesse horário.',
        confirmButtonColor: '#0d47a1'
      });
      return;
    }
    console.log('Paciente no momento da criação do agendamento:', paciente);
  
    const agendamento: Agendamento = {
      data: dataAgendamento,
      hora,
      nome,
      idade: this.idade,
      pacienteId: paciente.id, 
      estagiarioNome,
      estagiarioUid: estagiario.uid,
      status: 'pendente' 
    };
  
    const request = this.id
      ? this.agendamentoService.atualizarAgendamento({ ...agendamento, id: this.id })
      : this.agendamentoService.salvarAgendamento(agendamento);
  
    request
      .then(() => this.dialogRef.close(agendamento))
      .catch(error => console.error('Erro ao salvar agendamento:', error));
  }
  
  

  onInput(event: Event): void {
    const nome = (event.target as HTMLInputElement).value;
    this.buscarPacientes(nome);
  }

  onInputEstagiario(event: Event): void {
    const nome = (event.target as HTMLInputElement).value;
    this.buscarEstagiarios(nome);
  }
}