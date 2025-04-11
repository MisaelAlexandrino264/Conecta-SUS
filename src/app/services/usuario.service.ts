// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

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
}
