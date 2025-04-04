import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { doc, deleteDoc } from '@angular/fire/firestore';
import { updateDoc } from '@angular/fire/firestore';


export interface Agendamento {
  id?: string;  
  data: string;  
  hora: string;  
  nome: string;
  idade: number;
  uid?: string;
  profissionalNome?: string;
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
      uid: user.uid 
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






 // Obter agendamentos do usuário logado para uma data específica
obterMeusAgendamentosPorData(data: Date): Observable<Agendamento[]> {
  const user = this.auth.currentUser;

  if (!user) {
    console.error('Usuário não autenticado');
    return new Observable();
  }

  const dataString = data.toISOString().split('T')[0]; 
  const q = query(this.colecaoAgendamentos, 
                  where('data', '==', dataString),
                  where('uid', '==', user.uid)); 

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
      console.error("Erro ao obter agendamentos do usuário para a data:", error);
      observer.error(error);
    });
  });
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
      idade: agendamento.idade
    })
    .then(() => console.log("Agendamento atualizado com sucesso!"))
    .catch(error => console.error("Erro ao atualizar agendamento:", error));
  }
  

}
