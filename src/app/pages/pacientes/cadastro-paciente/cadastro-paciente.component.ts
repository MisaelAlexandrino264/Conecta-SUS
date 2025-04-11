import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PacienteService, Paciente } from '../../../services/paciente.service';

@Component({
  selector: 'app-cadastro-paciente',
  templateUrl: './cadastro-paciente.component.html',
  styleUrls: ['./cadastro-paciente.component.scss']
})
export class CadastroPacienteComponent implements OnInit {
  pacienteForm: FormGroup;
  isEditMode: boolean = false;
  pacienteId?: string; 

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CadastroPacienteComponent>,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { paciente: Paciente } 
  ) {
    this.pacienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      dataNascimento: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      numeroSus: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      sexo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cep: ['', [Validators.required, Validators.minLength(5)]],
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      bairro: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      complemento: ['']
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.paciente) {
      this.isEditMode = true;
      this.pacienteId = this.data.paciente.id;

      this.pacienteForm.patchValue(this.data.paciente);
    }
  }

  fechar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.pacienteForm.valid) {
      const paciente: Paciente = this.pacienteForm.value;
      const cpf = paciente.cpf;
  
      this.pacienteService.buscarPorCPF(cpf).subscribe(pacientesComMesmoCPF => {
        const isCpfDuplicado = pacientesComMesmoCPF.length > 0 &&
          (!this.isEditMode || (this.isEditMode && pacientesComMesmoCPF[0].id !== this.pacienteId));
  
        if (isCpfDuplicado) {
          this.snackBar.open('Já existe um paciente cadastrado com este CPF.', 'Fechar', { duration: 3000 });
          return;
        }
  
        if (this.isEditMode && this.pacienteId) {
          this.pacienteService.atualizarPaciente(this.pacienteId, paciente)
            .then(() => {
              this.snackBar.open('Paciente atualizado com sucesso!', 'Fechar', { duration: 3000 });
              this.fechar();
            })
            .catch((error) => console.error('Erro ao atualizar paciente:', error));
        } else {
          this.pacienteService.criarPaciente(paciente)
            .then(() => {
              this.snackBar.open('Paciente cadastrado com sucesso!', 'Fechar', { duration: 3000 });
              this.fechar();
            })
            .catch((error) => console.error('Erro ao salvar paciente:', error));
        }
      });
    } else {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
    }
  }
  
  

  buscarCEP(): void {
    const cep = this.pacienteForm.get('cep')?.value.replace(/\D/g, '');
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(dados => {
          if (!dados.erro) {
            this.pacienteForm.patchValue({
              rua: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.localidade,
              estado: dados.uf
            });
          } else {
            this.snackBar.open('CEP não encontrado.', 'Fechar', { duration: 3000 });
          }
        })
        .catch(() => {
          this.snackBar.open('Erro ao buscar o CEP. Tente novamente.', 'Fechar', { duration: 3000 });
        });
    }
  }
  

  
}
