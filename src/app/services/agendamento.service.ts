import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Agendamento {
  data: string;  // Formato 'YYYY-MM-DD'
  hora: string;  // Exemplo: '14:00'
  nome: string;
  idade: number;
  
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentoService {
  private colecaoAgendamentos = collection(this.firestore, 'agenda');

  constructor(private firestore: Firestore) {}

  // Salvar um agendamento
  salvarAgendamento(agendamento: Agendamento): Promise<void> {
    return addDoc(this.colecaoAgendamentos, agendamento)
      .then(() => console.log("Agendamento salvo com sucesso!"))
      .catch(error => console.error("Erro ao salvar agendamento:", error));
  }

  // Obter todos os agendamentos
  obterAgendamentos(): Observable<Agendamento[]> {
    return collectionData(this.colecaoAgendamentos, { idField: 'id' }) as Observable<Agendamento[]>;
  }

  // Obter agendamentos por data
  obterAgendamentosPorData(data: Date): Observable<Agendamento[]> {
    const dataString = data.toISOString().split('T')[0]; // Converte a data para formato YYYY-MM-DD
    const q = query(this.colecaoAgendamentos, where('data', '==', dataString)); // Filtra por data
    return new Observable((observer) => {
      getDocs(q).then((querySnapshot) => {
        const agendamentos: Agendamento[] = [];
        querySnapshot.forEach((doc) => {
          agendamentos.push(doc.data() as Agendamento); // Puxa os dados de cada agendamento
        });
        observer.next(agendamentos); // Emite os agendamentos encontrados
      }).catch((error) => {
        console.error("Erro ao obter agendamentos por data:", error);
        observer.error(error); // Emite erro, caso ocorra
      });
    });
  }
}
