import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-atendimento',
  templateUrl: './atendimento.component.html',
  styleUrls: ['./atendimento.component.scss']
})
export class AtendimentoComponent implements OnInit {
  id: string | null = null;
  nome: string = '';
  idade: number | null = null;

  anamnese: string = '';
  exameFisico: string = '';
  solicitacaoExames: string = '';
  orientacao: string = '';
  prescricao: string = '';
  formularios: string = '';
  cid10: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Recupera os parâmetros da URL
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.nome = params['nome'];
      this.idade = params['idade'];
    });
  }

  salvarAtendimento(): void {
    console.log('Atendimento salvo:', {
      id: this.id,
      nome: this.nome,
      idade: this.idade,
      anamnese: this.anamnese,
      exameFisico: this.exameFisico,
      solicitacaoExames: this.solicitacaoExames,
      orientacao: this.orientacao,
      prescricao: this.prescricao,
      formularios: this.formularios,
      cid10: this.cid10
    });
    alert('Atendimento salvo com sucesso!');
    this.router.navigate(['/home']);
  }

  cancelarAtendimento(): void {
    this.router.navigate(['/home']);
  }
}
