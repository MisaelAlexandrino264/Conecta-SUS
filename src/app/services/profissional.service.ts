
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Profissional {
  uid: string;
  nome: string;
  tipo: string; // Deve ser 'Profissional da Saúde'
}

@Injectable({
  providedIn: 'root'
})
export class ProfissionalService {
  constructor(private firestore: AngularFirestore) {}

  buscarProfissionaisPorNome(nome: string): Observable<any[]> {
    return this.firestore.collection('users', ref => 
      ref.where('tipo', '==', 'Profissional da saúde')
         .orderBy('nome')
         .startAt(nome)
         .endAt(nome + '\uf8ff')
    ).valueChanges().pipe(
      map(profissionais => {
        console.log('Profissionais encontrados:', profissionais); // ✅ Testar se está retornando dados
        return profissionais;
      })
    );
  }
  
  
}
