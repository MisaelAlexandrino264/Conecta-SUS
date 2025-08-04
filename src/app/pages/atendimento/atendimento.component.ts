import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtendimentoService, Atendimento } from '../../services/atendimento.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service'; 
import { MatDialog } from '@angular/material/dialog';
import  jsPDF  from 'jspdf';
import { ExportarPdfModalComponent } from '../../components/exportar-pdf-modal/exportar-pdf-modal.component';


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
  conduta: string = '';
  cid10: string = '';
  profissionalNome: string = '';
  pacienteId: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atendimentoService: AtendimentoService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Query Params recebidos:', params);
      
      this.id = params['id'] || null; 
      this.pacienteId = params['pacienteId'] || null;
      this.nome = params['nome'] || 'Desconhecido';
      this.idade = params['idade'] ? Number(params['idade']) : null;
      this.data = params['data'] || '';

    console.log('ID do agendamento:', this.id);
    console.log('ID do paciente:', this.pacienteId);
    console.log('Nome:', this.nome);
    console.log('Idade:', this.idade);
    console.log('Data:', this.data);
    });
  
    this.carregarUsuarioLogado(); // chamada correta
  }
  
  async carregarUsuarioLogado(): Promise<void> {
    const usuario = await this.authService.getUsuarioLogado();
    this.profissionalNome = usuario?.nome || 'Desconhecido';
  }
  
  
  

  async salvarAtendimento(): Promise<void> {
    if (!this.pacienteId || !this.id|| !this.nome || !this.data) {
      alert('Erro ao salvar o atendimento: Dados incompletos.');
      return;
    }
  
    const usuario = await this.authService.getUsuarioLogado();
    if (!usuario) {
      alert('Erro: usuário logado não encontrado.');
      return;
    }
  
    const atendimento: Atendimento = {
      pacienteId: this.pacienteId,
      nome: this.nome,
      idade: this.idade!,
      data: this.data,
      anamnese: this.anamnese,
      exameFisico: this.exameFisico,
      solicitacaoExames: this.solicitacaoExames,
      orientacao: this.orientacao,
      prescricao: this.prescricao,
      conduta: this.conduta,
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

  abrirModalExportarPDF() {
  const dialogRef = this.dialog.open(ExportarPdfModalComponent);

  dialogRef.afterClosed().subscribe(camposSelecionados => {
    if (camposSelecionados) {
      const img = new Image();
      img.src = 'assets/logo.png';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/png');

        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const maxWidth = pageWidth - 2 * margin;
        const lineHeight = 8;

        let y = 10;

       
        const imgWidth = 50;
        const imgX = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, 'PNG', imgX, y, imgWidth, 20);
        y += 30;

       
        doc.setFontSize(12);
        const titulo = `Atendimento - ${this.nome} (${this.idade} anos)`;
        const tituloLines = doc.splitTextToSize(titulo, maxWidth);
        doc.text(tituloLines, margin, y);
        y += tituloLines.length * lineHeight;

       
        const adicionarCampo = (label: string, conteudo: string | null) => {
          const text = `${label}: ${conteudo || '-'}`;
          const lines = doc.splitTextToSize(text, maxWidth);
          if (y + lines.length * lineHeight > pageHeight - 20) {
            doc.addPage();
            y = 10;
          }
          doc.text(lines, margin, y);
          y += lines.length * lineHeight;
        };

       
        if (camposSelecionados.anamnese) adicionarCampo('Anamnese', this.anamnese);
        if (camposSelecionados.exameFisico) adicionarCampo('Exame Físico', this.exameFisico);
        if (camposSelecionados.solicitacaoExames) adicionarCampo('Solicitação de Exames', this.solicitacaoExames);
        if (camposSelecionados.orientacao) adicionarCampo('Orientação', this.orientacao);
        if (camposSelecionados.prescricao) adicionarCampo('Prescrição', this.prescricao);
        if (camposSelecionados.conduta) adicionarCampo('Conduta', this.conduta);
        if (camposSelecionados.cid10) adicionarCampo('CID-10', this.cid10);

        
        doc.setFontSize(10);
        const footerY1 = pageHeight - 15;
        const footerY2 = pageHeight - 8;
        doc.text('Clínica Médica UNICENTRO', margin, footerY1);
        doc.text(
          'Endereço: Alameda Élio Antonio Dalla Vecchia, 838 - CEP 85040-167 - Bairro - Vila Carli, Guarapuava - PR',
          margin,
          footerY2
        );

        doc.save(`atendimento_${this.nome}.pdf`);
      };
    }
  });
}


}
