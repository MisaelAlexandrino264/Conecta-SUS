import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgendamentoService, Agendamento } from '../../../services/agendamento.service';
import { PacienteService, Paciente } from '../../../services/paciente.service';
import { ProfissionalService, Profissional } from '../../../services/profissional.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agendamento-modal',
  templateUrl: './agendamento-modal.component.html',
  styleUrls: ['./agendamento-modal.component.scss']
})
export class AgendamentoModalComponent implements OnInit {
  agendamentoForm!: FormGroup;
  pacientesFiltrados: Paciente[] = [];
  profissionaisFiltrados: Profissional[] = [];
  idade: number | null = null;
  id?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgendamentoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataSelecionada: Date, agendamento?: Agendamento },
    private agendamentoService: AgendamentoService,
    private pacienteService: PacienteService,
    private profissionalService: ProfissionalService
  ) {}

  ngOnInit(): void {
    this.agendamentoForm = this.fb.group({
      hora: ['', Validators.required],
      nome: ['', Validators.required],
      profissionalNome: ['', Validators.required]
    });
  
    if (this.data.agendamento) {
      const { hora, nome, profissionalNome } = this.data.agendamento;
      this.idade = this.data.agendamento.idade;
      this.id = this.data.agendamento.id;
  
      this.agendamentoForm.patchValue({ hora, nome, profissionalNome });
  
      // Carrega paciente para que o nome seja considerado válido
      this.pacienteService.buscarPacientePorNome(nome).subscribe(pacientes => {
        this.pacientesFiltrados = pacientes;
  
        this.agendamentoForm.get('nome')?.setValidators([
          Validators.required,
          this.pacienteValidoValidator(this.pacientesFiltrados)
        ]);
        this.agendamentoForm.get('nome')?.updateValueAndValidity();
      });
  
      // Carrega profissional para que o nome seja considerado válido
      this.profissionalService.buscarProfissionaisPorNome(profissionalNome || '').subscribe(profissionais => {
        this.profissionaisFiltrados = profissionais;
  
        this.agendamentoForm.get('profissionalNome')?.setValidators([
          Validators.required,
          this.profissionalValidoValidator(this.profissionaisFiltrados)
        ]);
        this.agendamentoForm.get('profissionalNome')?.updateValueAndValidity();
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

  buscarProfissionais(nome: string): void {
    if (nome.length < 2) {
      this.profissionaisFiltrados = [];
      return;
    }

    this.profissionalService.buscarProfissionaisPorNome(nome).subscribe(profissionais => {
      this.profissionaisFiltrados = profissionais;

      this.agendamentoForm.get('profissionalNome')?.setValidators([
        Validators.required,
        this.profissionalValidoValidator(this.profissionaisFiltrados)
      ]);
      this.agendamentoForm.get('profissionalNome')?.updateValueAndValidity();
    });
  }

  pacienteValidoValidator(pacientes: Paciente[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.value;
      return pacientes.some(p => p.nome === nome) ? null : { pacienteInvalido: true };
    };
  }

  profissionalValidoValidator(profissionais: Profissional[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const nome = control.value;
      return profissionais.some(p => p.nome === nome) ? null : { profissionalInvalido: true };
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
  
    const { hora, nome, profissionalNome } = this.agendamentoForm.value;
    const paciente = this.pacientesFiltrados.find(p => p.nome === nome);
    const profissional = this.profissionaisFiltrados.find(p => p.nome === profissionalNome);
  
    if (!paciente || !profissional) return;
  
    this.idade = this.calcularIdade(paciente.dataNascimento);
    const dataAgendamento = this.data.dataSelecionada.toISOString().split('T')[0];
  
    const podeAgendar = await this.agendamentoService.verificarDisponibilidade(
      profissional.uid,
      dataAgendamento,
      hora,
      this.id 
    );
  
    if (!podeAgendar) {
      Swal.fire({
        icon: 'warning',
        title: 'Erro ao agendar',
        text: 'Esse profissional já tem um agendamento nesse horário.',
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
      profissionalNome,
      profissionalUid: profissional.uid
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

  onInputProfissional(event: Event): void {
    const nome = (event.target as HTMLInputElement).value;
    this.buscarProfissionais(nome);
  }
}
