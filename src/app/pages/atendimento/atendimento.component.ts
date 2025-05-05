import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtendimentoService, Atendimento } from '../../services/atendimento.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service'; 


@Component({
  selector: 'app-atendimento',
  templateUrl: './atendimento.component.html',
  styleUrls: ['./atendimento.component.scss']
})
export class AtendimentoComponent implements OnInit {
  id: string | null = null;
  nome: string = '';
  idade: number | null = null;
  data: string = ''; 

  anamnese: string = '';
  exameFisico: string = '';
  solicitacaoExames: string = '';
  orientacao: string = '';
  prescricao: string = '';
  formularios: string = '';
  cid10: string = '';
  profissionalNome: string = '';


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atendimentoService: AtendimentoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'] || null;
      this.nome = params['nome'] || 'Desconhecido';
      this.idade = params['idade'] ? Number(params['idade']) : null;
      this.data = params['data'] || '';
    });
  
    this.carregarUsuarioLogado(); // chamada correta
  }
  
  async carregarUsuarioLogado(): Promise<void> {
    const usuario = await this.authService.getUsuarioLogado();
    this.profissionalNome = usuario?.nome || 'Desconhecido';
  }
  
  
  

  async salvarAtendimento(): Promise<void> {
    if (!this.id || !this.nome || !this.data) {
      alert('Erro ao salvar o atendimento: Dados incompletos.');
      return;
    }
  
    const usuario = await this.authService.getUsuarioLogado();
    if (!usuario) {
      alert('Erro: usuário logado não encontrado.');
      return;
    }
  
    const atendimento: Atendimento = {
      nome: this.nome,
      idade: this.idade!,
      data: this.data,
      anamnese: this.anamnese,
      exameFisico: this.exameFisico,
      solicitacaoExames: this.solicitacaoExames,
      orientacao: this.orientacao,
      prescricao: this.prescricao,
      formularios: this.formularios,
      cid10: this.cid10,
      status: 'Finalizado',
      profissionalUid: usuario.uid,
      profissionalNome: usuario.nome
    };
  
    await this.atendimentoService.salvarAtendimento(atendimento);
    await this.atendimentoService.marcarAtendimentoComoRealizado(this.id);
  
    this.router.navigate(['/home']);
    Swal.fire('Finalizado!', 'Atendimento realizado com sucesso.', 'success');
  }
  
  

  cancelarAtendimento(): void {
    Swal.fire({
          title: 'Voltar para Início?',
          text: 'Esta ação não pode ser desfeita!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sim, voltar!',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/home']);
              }
            });
  }
}
