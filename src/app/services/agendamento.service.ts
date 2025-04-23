import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { doc, deleteDoc } from '@angular/fire/firestore';
import { updateDoc } from '@angular/fire/firestore';
import { onAuthStateChanged } from '@angular/fire/auth';



export interface Agendamento {
  id?: string;  
  data: string;  
  hora: string;  
  nome: string;
  idade: number;
  uid?: string;
  profissionalNome?: string;
  profissionalUid?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private colecaoAgendamentos = collection(this.firestore, 'agenda');

  constructor(private firestore: Firestore, private auth: Auth) {}

  async salvarAgendamento(agendamento: Agendamento): Promise<void> {
    const user = this.auth.currentUser;
  
    if (!user) {
      console.error('Usuário não autenticado');
      return;
    }
  
    const agendamentoComUid = {
      ...agendamento,
      criadoPorUid: user.uid 
    };
  
    await addDoc(this.colecaoAgendamentos, agendamentoComUid)
      .then(() => console.log("Agendamento salvo com sucesso!"))
      .catch(error => console.error("Erro ao salvar agendamento:", error));
  }
  
  

obterMeusAgendamentos(): Observable<Agendamento[]> {
  const user = this.auth.currentUser;

  if (!user) {
    console.error('Usuário não autenticado');
    return new Observable();
  }

  const q = query(this.colecaoAgendamentos, where('uid', '==', user.uid));

  return new Observable((observer) => {
    getDocs(q).then((querySnapshot) => {
      const agendamentos: Agendamento[] = [];
      querySnapshot.forEach((doc) => {
        const agendamento = doc.data() as Agendamento;
        agendamentos.push({
          ...agendamento,
          id: doc.id 
        });
      });
      observer.next(agendamentos);
    }).catch((error) => {
      console.error("Erro ao obter agendamentos do usuário:", error);
      observer.error(error);
    });
  });
}



obterMeusAgendamentosPorData(data: Date): Observable<Agendamento[]> {
  const dataString = data.toISOString().split('T')[0];

  return new Observable<Agendamento[]>((observer) => {
    onAuthStateChanged(this.auth, (user) => {
      if (!user) {
        console.error('Usuário não autenticado');
        observer.next([]); // retorna lista vazia
        return;
      }

      const q = query(this.colecaoAgendamentos,
        where('data', '==', dataString),
        where('profissionalUid', '==', user.uid));

      getDocs(q)
        .then((querySnapshot) => {
          const agendamentos: Agendamento[] = [];
          querySnapshot.forEach((doc) => {
            const agendamento = doc.data() as Agendamento;
            agendamentos.push({
              ...agendamento,
              id: doc.id
            });
          });
          observer.next(agendamentos);
        })
        .catch((error) => {
          console.error("Erro ao obter agendamentos:", error);
          observer.error(error);
        });
    });
  });
}

obterAgendamentosPorData(data: Date): Observable<Agendamento[]> {
  const dataString = data.toISOString().split('T')[0];

  const q = query(this.colecaoAgendamentos, where('data', '==', dataString));

  return new Observable<Agendamento[]>((observer) => {
    getDocs(q).then((querySnapshot) => {
      const agendamentos: Agendamento[] = [];
      querySnapshot.forEach((doc) => {
        const agendamento = doc.data() as Agendamento;
        agendamentos.push({ ...agendamento, id: doc.id });
      });
      observer.next(agendamentos);
    }).catch((error) => {
      console.error("Erro ao obter agendamentos (secretaria):", error);
      observer.error(error);
    });
  });
}


async verificarDisponibilidade(profissionalUid: string, data: string, hora: string, agendamentoId?: string): Promise<boolean> {
  const q = query(this.colecaoAgendamentos,
    where('profissionalUid', '==', profissionalUid),
    where('data', '==', data),
    where('hora', '==', hora)
  );

  const snapshot = await getDocs(q);

  // Se nenhum agendamento nesse horário, está livre
  if (snapshot.empty) return true;

  // Se for edição, verificar se o único agendamento é ele mesmo
  if (agendamentoId && snapshot.size === 1) {
    const doc = snapshot.docs[0];
    return doc.id === agendamentoId;
  }

  // Caso contrário, está ocupado
  return false;
}





  async excluirAgendamento(id: string): Promise<void> {
    if (!id) {
      console.error("Erro: ID do agendamento está indefinido!");
      return;
    }
  
    const docRef = doc(this.firestore, `agenda/${id}`);
    
    
    await deleteDoc(docRef)
      .then(() => console.log("Agendamento excluído com sucesso!"))
      .catch(error => console.error("Erro ao excluir agendamento:", error));
  }

  async atualizarAgendamento(agendamento: Agendamento): Promise<void> {
    if (!agendamento.id) {
      console.error("Erro: ID do agendamento está indefinido!");
      return;
    }
  
    const docRef = doc(this.firestore, `agenda/${agendamento.id}`);
  
    await updateDoc(docRef, {
      data: agendamento.data,
      hora: agendamento.hora,
      nome: agendamento.nome,
      idade: agendamento.idade,
      profissionalNome: agendamento.profissionalNome,
      profissionalUid: agendamento.profissionalUid
    })
    .then(() => console.log("Agendamento atualizado com sucesso!"))
    .catch(error => console.error("Erro ao atualizar agendamento:", error));
  }
  
  

}
