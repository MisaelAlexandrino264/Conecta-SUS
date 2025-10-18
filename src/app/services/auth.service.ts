import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, firstValueFrom } from 'rxjs'; // 'firstValueFrom' vem de 'rxjs'
import { switchMap, map } from 'rxjs/operators'; // 'map' vem de 'rxjs/operators'
import { Agendamento } from './agendamento.service';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioLogadoSubject = new BehaviorSubject<any | null>(null);
  public usuarioLogado$ = this.usuarioLogadoSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc(user.uid).valueChanges();
        } else {
          return of(null);
        }
      })
    ).subscribe(userData => {
      this.usuarioLogadoSubject.next(userData);
    });
  }

  // --- MÉTODOS PRINCIPAIS ---

  async login(email: string, password: string) {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/home']);
    } catch (error: any) {
      // Seu handleAuthError aqui
    }
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  async registerInterno(email: string, password: string, departamento: string, nome: string, tipo: string): Promise<void> {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const app = initializeApp(environment.firebaseConfig, 'segundoApp');
    const secondAuth = getAuth(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondAuth, email, password);
      const newUser = userCredential.user;
      if (newUser) {
        await this.firestore.collection('users').doc(newUser.uid).set({ uid: newUser.uid, email, departamento, nome, tipo });
      }
    } catch (error) {
      // Tratar erro
    }
  }

  async atualizarUsuario(uid: string, nome: string, tipo: string, departamento: string): Promise<void> {
    await this.firestore.collection('users').doc(uid).update({ nome, tipo, departamento });
  }

  async enviarEmailRedefinicaoSenha(email: string): Promise<void> {
    await this.afAuth.sendPasswordResetEmail(email);
  }

  // --- MÉTODOS DE COMPATIBILIDADE PARA CORRIGIR ERROS ---

  getUsuarioLogado(): Promise<any | null> {
    return firstValueFrom(this.usuarioLogado$);
  }
  
  async getTipoUsuario(): Promise<string | null> {
    const user = await this.getUsuarioLogado();
    return user?.tipo || null;
  }

  getTipoUsuarioLocal(): string | null {
    return this.usuarioLogadoSubject.getValue()?.tipo || null;
  }
  
  getUser(): Observable<any> {
    return this.afAuth.authState;
  }

  // --- MÉTODOS DE PERMISSÃO ---

  podeGerenciarUsuarios(): Observable<boolean> {
    return this.usuarioLogado$.pipe(map(user => user?.tipo === 'Secretaria'));
  }

  podeGerenciarEstagiarios(): Observable<boolean> {
    return this.usuarioLogado$.pipe(map(user => user?.tipo === 'Professor' || user?.tipo === 'Secretaria'));
  }
}
