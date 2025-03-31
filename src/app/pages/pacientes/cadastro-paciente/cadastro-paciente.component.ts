import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PacienteService, Paciente } from '../../../services/paciente.service';

@Component({
  selector: 'app-cadastro-paciente',
  templateUrl: './cadastro-paciente.component.html',
  styleUrls: ['./cadastro-paciente.component.scss']
})
export class CadastroPacienteComponent {
  pacienteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CadastroPacienteComponent>,
    private pacienteService: PacienteService,
    private snackBar: MatSnackBar
  ) {
    this.pacienteForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      dataNascimento: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // 11 dígitos
      numeroSus: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]], // 15 dígitos
      telefone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]], // 10 ou 11 dígitos
      email: ['', [Validators.required, Validators.email]],
      cep: ['', [Validators.required, Validators.minLength(5)]], // 8 dígitos
      cidade: ['', [Validators.required, Validators.minLength(2)]],
      rua: ['', [Validators.required, Validators.minLength(3)]],
      bairro: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]], // Apenas números
      complemento: ['']
    });
  }

  fechar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.pacienteForm.valid) {
      const paciente: Paciente = this.pacienteForm.value;
      
      this.pacienteService.criarPaciente(paciente)
        .then(() => {
          this.snackBar.open('Paciente cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.fechar();
        })
        .catch((error) => console.error('Erro ao salvar paciente:', error));
    } else {
      this.snackBar.open('Preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
    }
  }
}
