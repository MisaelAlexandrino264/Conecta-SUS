import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
          alert('Usuário removido do sistema. Entre em contato com o administrador.');
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
    const app = initializeApp(environment.firebaseConfig, 'segundoApp'); // ✅ aqui corrigido
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
        alert('Usuário cadastrado com sucesso!');
      }
    } catch (error: any) {
      console.error("Erro ao registrar novo usuário internamente:", error);
      alert("Erro ao cadastrar o usuário: " + (error?.message || ''));
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
  

  private handleAuthError(error: any) {
    console.error("Erro de autenticação:", error); 
  
    let errorMsg = "Erro ao processar a solicitação. Tente novamente.";
  
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "Este e-mail já está em uso!";
    } else if (error.code === 'auth/weak-password') {
      errorMsg = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = "O e-mail fornecido não é válido.";
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      errorMsg = "Email ou senha incorretos.";
    }
  
    alert(errorMsg);
  }
  
  
  
}
