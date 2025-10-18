// src/app/services/atendimento.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// --- INTERFACE ATUALIZADA ---
// Adicionamos os campos 'status' e 'observacaoProfessor'
export interface Atendimento {
  id?: string;
  data: string;
  hora?: string;
  nome: string; // Nome do Paciente
  idade: number;
  pacienteId: string;
  estagiarioNome: string;
  estagiarioUid: string;
  professorResponsavelUid: string; // ID do professor responsável
  professorResponsavelNome: string; // Nome do professor para exibição
  anamnese: string;
  exameFisico: string;
  solicitacaoExames: string;
  orientacao: string;
  prescricao: string;
  conduta: string;
  cid10: string;
  status: 'pendente' | 'aceito' | 'rejeitado'; // Status da avaliação
  observacaoProfessor?: string; // Observação opcional do professor
}

@Injectable({
  providedIn: 'root'
})
export class AtendimentoService {
  private atendimentosCollection: AngularFirestoreCollection<Atendimento>;

  constructor(private firestore: AngularFirestore, private authService: AuthService) {
    this.atendimentosCollection = this.firestore.collection<Atendimento>('atendimentos');
  }

  criarAtendimento(atendimento: Atendimento): Promise<any> {
    // Remove o ID para que o Firestore gere um novo
    const { id, ...data } = atendimento;
    return this.atendimentosCollection.add(data);
  }

  // --- NOVO MÉTODO ---
  // Para o professor salvar a avaliação de um atendimento.
  avaliarAtendimento(id: string, status: 'aceito' | 'rejeitado', observacao: string): Promise<void> {
    return this.atendimentosCollection.doc(id).update({
      status: status,
      observacaoProfessor: observacao
    });
  }

  // --- MÉTODOS EXISTENTES (sem alterações necessárias) ---

  // (Seus outros métodos como obterAtendimentosPorPaciente, salvarAgendamento, etc., continuam aqui)
  async obterAtendimentosPorPaciente(pacienteId: string): Promise<Atendimento[]> {
    const snapshot = await this.firestore.collection<Atendimento>('atendimentos', ref =>
      ref.where('pacienteId', '==', pacienteId)
    ).get().toPromise();

    if (!snapshot) {
      return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  obterAtendimentosPendentesPorProfessor(professorUid: string): Observable<Atendimento[]> {
    return this.firestore.collection<Atendimento>('atendimentos', ref => ref
      .where('status', '==', 'pendente')
      .where('professorResponsavelUid', '==', professorUid)
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }
}