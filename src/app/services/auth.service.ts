import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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
      await this.afAuth.signInWithEmailAndPassword(email, password);
      this.router.navigate(['/home']); // Apenas redireciona, sem alert
    } catch (error: any) {
      this.handleAuthError(error); // Exibe erro apenas em caso de falha
    }
  }
  

  async register(email: string, password: string, departamento: string, nome: string) {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      if (user) {
        console.log("Usuário criado com sucesso:", user.uid); // Debug
  
        // Aguardar a gravação no Firestore
        await this.firestore.collection('users').doc(user.uid).set({
          uid: user.uid,
          email: user.email,
          departamento: departamento,
          nome: nome
        });
  
        this.router.navigate(['/home']);
      } else {
        throw new Error("Usuário não foi criado corretamente.");
      }
    } catch (error: any) {
      console.error("Erro ao registrar:", error); // Exibe erro detalhado no console
      this.handleAuthError(error);
    }
  }
  

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  getUser(): Observable<any> {
    return this.afAuth.authState; // Retorna o estado de autenticação
  }

  private handleAuthError(error: any) {
    console.error("Erro de autenticação:", error); // Exibe detalhes do erro no console
  
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
