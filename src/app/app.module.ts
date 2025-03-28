import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LoginComponent } from './pages/login/login.component';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { HomeComponent } from './pages/home/home.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment.development';
import {AngularFireModule} from '@angular/fire/compat';
import { MenuComponent } from './components/menu/menu.component'
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AgendamentoModalComponent } from './pages/home/agendamento-modal/agendamento-modal.component';
import { AtendimentoComponent } from './pages/atendimento/atendimento.component';

import { MatIconModule } from '@angular/material/icon';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { CadastroPacienteComponent } from './pages/pacientes/cadastro-paciente/cadastro-paciente.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CadastroComponent,
    HomeComponent,
    MenuComponent,
    AgendamentoModalComponent,
    AtendimentoComponent,
    PacientesComponent,
    CadastroPacienteComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    FormsModule,
    MatIconModule
  ],
  providers: [
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({"projectId":"interpront-4f172","appId":"1:980688439092:web:237a89b99c1c5514590761","storageBucket":"interpront-4f172.firebasestorage.app","apiKey":"AIzaSyCklXu3kq4XUq355NK40L4CsXTFsVrR1yw","authDomain":"interpront-4f172.firebaseapp.com","messagingSenderId":"980688439092"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
