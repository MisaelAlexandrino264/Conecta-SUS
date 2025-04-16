import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  tipoUsuario: string | null = null;
  
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.tipoUsuario = this.authService.getTipoUsuarioLocal();
  
    if (!this.tipoUsuario) {
      this.authService.getTipoUsuario().then(tipo => {
        this.tipoUsuario = tipo;
      });
    }
  }
  

  logout() {
    this.authService.logout();  
  }
}
