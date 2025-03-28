import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from '../app/auth.guard';
import { AtendimentoComponent } from './pages/atendimento/atendimento.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Protegendo a rota home
  { path: 'atendimento', component: AtendimentoComponent, canActivate: [AuthGuard] },
  { path: 'pacientes', component: PacientesComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }