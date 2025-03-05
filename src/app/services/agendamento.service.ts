import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Agendamento {
  data: string;  // Formato 'YYYY-MM-DD'
  hora: string;  // Exemplo: '14:00'
  nome: string;
  idade: number;
  uid?: string;  // Adicionamos o UID do usuário autenticado
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private colecaoAgendamentos = collection(this.firestore, 'agenda');

  constructor(private firestore: Firestore, private auth: Auth) {}

  // Salvar um agendamento com UID do usuário autenticado
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

  // Obter todos os agendamentos do usuário autenticado
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
          agendamentos.push(doc.data() as Agendamento);
        });
        observer.next(agendamentos);
      }).catch((error) => {
        console.error("Erro ao obter agendamentos do usuário:", error);
        observer.error(error);
      });
    });
  }

  // Obter apenas os agendamentos do usuário logado para uma data específica
  obterMeusAgendamentosPorData(data: Date): Observable<Agendamento[]> {
    const user = this.auth.currentUser;

    if (!user) {
      console.error('Usuário não autenticado');
      return new Observable();
    }

    const dataString = data.toISOString().split('T')[0]; // Converte a data para formato YYYY-MM-DD
    const q = query(this.colecaoAgendamentos, 
                    where('data', '==', dataString),
                    where('uid', '==', user.uid)); // Filtra por data e UID

    return new Observable((observer) => {
      getDocs(q).then((querySnapshot) => {
        const agendamentos: Agendamento[] = [];
        querySnapshot.forEach((doc) => {
          agendamentos.push(doc.data() as Agendamento);
        });
        observer.next(agendamentos);
      }).catch((error) => {
        console.error("Erro ao obter agendamentos do usuário para a data:", error);
        observer.error(error);
      });
    });
  }
}
