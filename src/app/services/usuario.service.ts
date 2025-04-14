// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  tipo: string;
  departamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private firestore: AngularFirestore) {}

  obterUsuarios(): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('users').valueChanges();
  }

async excluirUsuario(uid: string): Promise<void> {
  try {
    await this.firestore.collection('users').doc(uid).delete();
    console.log(`Usuário com UID ${uid} excluído do Firestore.`);
  } catch (error) {
    console.error("Erro ao excluir usuário do Firestore:", error);
    throw error;
  }
}

  
}
