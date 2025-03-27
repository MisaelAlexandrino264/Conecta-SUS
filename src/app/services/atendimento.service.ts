import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc } from '@angular/fire/firestore';

export interface Atendimento {
  id?: string;
  nome: string;
  idade: number;
  data: string; 
  anamnese: string;
  exameFisico: string;
  solicitacaoExames: string;
  orientacao: string;
  prescricao: string;
  formularios: string;
  cid10: string;
  status: string; 
}

@Injectable({
  providedIn: 'root'
})
export class AtendimentoService {
  private colecaoAtendimentos = collection(this.firestore, 'atendimentos');

  constructor(private firestore: Firestore) {}

  async salvarAtendimento(atendimento: Atendimento): Promise<void> {
    await addDoc(this.colecaoAtendimentos, atendimento);
    console.log('Atendimento salvo com sucesso!');
  }

  async marcarAtendimentoComoRealizado(agendamentoId: string): Promise<void> {
    const agendamentoRef = doc(this.firestore, `agenda/${agendamentoId}`);
    await updateDoc(agendamentoRef, { status: 'Finalizado' });
  }
}
