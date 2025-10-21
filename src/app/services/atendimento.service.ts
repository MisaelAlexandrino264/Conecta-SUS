// src/app/services/atendimento.service.ts

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Atendimento {
  id?: string;
  data: string;
  hora?: string;
  nome: string;
  idade: number;
  pacienteId: string;
  estagiarioNome: string;
  estagiarioUid: string;
  professorResponsavelUid: string;
  professorResponsavelNome: string;
  anamnese: string;
  exameFisico: string;
  solicitacaoExames: string;
  orientacao: string;
  prescricao: string;
  conduta: string;
  cid10: string;
  status: 'pendente' | 'aceito' | 'rejeitado';
  observacaoProfessor?: string;
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
    const { id, ...data } = atendimento;
    return this.atendimentosCollection.add(data);
  }

  avaliarAtendimento(id: string, status: 'aceito' | 'rejeitado', observacao: string): Promise<void> {
    return this.atendimentosCollection.doc(id).update({
      status: status,
      observacaoProfessor: observacao
    });
  }

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