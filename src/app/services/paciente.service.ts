import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Paciente {
  id?: string; // Opcional, pois o Firebase gera o ID automaticamente
  nome: string;
  dataNascimento: string;
  cpf: string;
  numeroSus: string;
  telefone: string;
  email: string;
  cep: string;
  cidade: string;
  rua: string;
  bairro: string;
  numero: string;
  complemento: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private pacientesCollection: AngularFirestoreCollection<Paciente>;

  constructor(private firestore: AngularFirestore) {
    this.pacientesCollection = firestore.collection<Paciente>('pacientes');
  }

  criarPaciente(paciente: Paciente): Promise<void> {
    const id = this.firestore.createId();
    return this.pacientesCollection.doc(id).set({ ...paciente, id });
  }

  obterPacientes(): Observable<Paciente[]> {
    return this.pacientesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Paciente;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  obterPacientePorId(id: string): Observable<Paciente | undefined> {
    return this.pacientesCollection.doc<Paciente>(id).valueChanges();
  }

  atualizarPaciente(id: string, paciente: Paciente) {
    return this.firestore.collection('pacientes').doc(id).update(paciente);
  }  

  deletarPaciente(id: string) {
    return this.firestore.collection('pacientes').doc(id).delete();
  }
  

}
