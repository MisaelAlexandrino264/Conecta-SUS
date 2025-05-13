import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tipoUsuario: string | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async login(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      if (user) {
        const docRef = this.firestore.collection('users').doc(user.uid);
        const snapshot = await docRef.ref.get();
  
        if (!snapshot.exists) {
          // Se não encontrou o usuário no Firestore
          await this.afAuth.signOut();
          Swal.fire({
            icon: 'error',
            title: 'Erro ao realizar login',
            text: 'Usuário removido do sistema. Entre em contato com o administrador.',
            confirmButtonColor: '#d33'
          });
          
          return;
        }
  
        this.router.navigate(['/home']);
      }
  
    } catch (error: any) {
      this.handleAuthError(error); 
    }
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
        await this.firestore.collection('users').doc(newUser.uid).set({
          uid: newUser.uid,
          email: newUser.email,
          departamento: departamento,
          nome: nome,
          tipo: tipo
        });
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Usuário cadastrado com sucesso!',
          confirmButtonColor: '#0d47a1'
        });
        
      }
    } catch (error: any) {
      console.error("Erro ao registrar novo usuário internamente:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao cadastrar o usuário',
        text: error?.message || 'Erro desconhecido.',
        confirmButtonColor: '#d33'
      });
      
    }
  }
  
  
  
  
  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getUser(): Observable<any> {
    return this.afAuth.authState; 
  }

  async atualizarUsuario(uid: string, nome: string, tipo: string, departamento: string): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).update({
        nome,
        tipo,
        departamento
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário no Firestore:', error);
      throw error;
    }
  }

  getTipoUsuarioLocal(): string | null {
    return this.tipoUsuario;
  }

  async getTipoUsuario(): Promise<string | null> {
    if (this.tipoUsuario) return this.tipoUsuario;
  
    const currentUser = await this.afAuth.currentUser;
    if (!currentUser) return null;
  
    const snapshot = await this.firestore.collection('users').doc(currentUser.uid).get().toPromise();
    const data = snapshot?.data() as { tipo?: string } | undefined; 
    this.tipoUsuario = data?.tipo || null;
    return this.tipoUsuario;
  }
  
  async getUsuarioLogado(): Promise<any | null> {
    const currentUser = await this.afAuth.currentUser;
    if (!currentUser) return null;
  
    const snapshot = await this.firestore.collection('users').doc(currentUser.uid).get().toPromise();
    return snapshot?.data() || null;
  }
  
  enviarEmailRedefinicaoSenha(email: string): Promise<void> {
  return this.afAuth.sendPasswordResetEmail(email);
}

  private handleAuthError(error: any) {
    console.error("Erro de autenticação:", error); 
  
    let errorMsg = "Erro ao processar a solicitação. Tente novamente.";
  
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "Este e-mail já está em uso!";
    } else if (error.code === 'auth/weak-password') {
      errorMsg = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = "O e-mail fornecido não é válido.";
    } else if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      errorMsg = "Email ou senha incorretos.";
    }
  
    Swal.fire({
      icon: 'error',
      title: 'Erro de autenticação',
      text: errorMsg,
      confirmButtonColor: '#0d47a1'
    });
  }
  
  
  
  
}
