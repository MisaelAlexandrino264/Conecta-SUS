import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendamentoService, Agendamento } from '../../services/agendamento.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-atendimento',
  templateUrl: './atendimento.component.html',
  styleUrls: ['./atendimento.component.scss']
})
export class AtendimentoComponent implements OnInit {
  atendimentoForm: FormGroup;
  agendamentoId: string | null = null;
  pacienteId: string | null = null;
  nome: string | null = null;
  idade: number | null = null;
  estagiarioNome: string | null = null;
  dataAtendimento: string | null = null;
  private estagiarioUid: string | null = null;
  private professorResponsavelUid: string | null = null;
  private professorResponsavelNome: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private agendamentoService: AgendamentoService,
    private authService: AuthService
  ) {
    this.atendimentoForm = this.fb.group({
      anamnese: ['', Validators.required],
      exameFisico: ['', Validators.required],
      solicitacaoExames: [''],
      orientacao: [''],
      prescricao: [''],
      conduta: ['', Validators.required],
      cid10: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.agendamentoId = params['id'];
      this.pacienteId = params['pacienteId'];
      this.nome = params['nome'];
      this.idade = params['idade'];
      this.dataAtendimento = params['data'];
      this.professorResponsavelNome = params['professorNome'];
      this.professorResponsavelUid = params['professorUid'];
    });

    this.authService.getUsuarioLogado().then(user => {
      if (user) {
        this.estagiarioNome = user.nome;
        this.estagiarioUid = user.uid;
      }
    });
  }

  async salvarAtendimento(): Promise<void> {
    if (this.atendimentoForm.invalid) {
      this.atendimentoForm.markAllAsTouched();
      Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    if (!this.agendamentoId) {
      Swal.fire('Erro Crítico', 'Não foi possível identificar o agendamento original.', 'error');
      return;
    }
    
    const atendimentoParaSalvar: Agendamento = {
      ...this.atendimentoForm.value,
      agendamentoId: this.agendamentoId,
      pacienteId: this.pacienteId!,
      nome: this.nome!,
      idade: this.idade!,
      data: this.dataAtendimento!,
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'pendente',
      estagiarioNome: this.estagiarioNome!,
      estagiarioUid: this.estagiarioUid!,
      professorResponsavelNome: this.professorResponsavelNome!,
      professorResponsavelUid: this.professorResponsavelUid!
    };

    try {
      await this.agendamentoService.criarAtendimento(atendimentoParaSalvar);
      console.log('Passo 1/2: Registro de ATENDIMENTO criado com sucesso.');

      console.log('Passo 2/2: Tentando marcar o AGENDAMENTO original como finalizado. ID:', this.agendamentoId);
      await this.agendamentoService.marcarAgendamentoComoFinalizado(this.agendamentoId)
        .then(() => {
          console.log('SUCESSO: Status do AGENDAMENTO original atualizado para "finalizado".');
        })
        .catch(err => {
          console.error('FALHA ao atualizar status do AGENDAMENTO original:', err);
        });

      Swal.fire('Sucesso!', 'Atendimento salvo e finalizado com sucesso.', 'success');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error("ERRO CRÍTICO no salvamento:", error);
      Swal.fire('Erro!', 'Ocorreu um problema ao salvar o atendimento.', 'error');
    }
  }

  cancelar(): void {
    this.router.navigate(['/home']);
  }

  abrirModalExportarPDF(): void {
    console.log("Lógica para exportar PDF aqui...");
  }
}