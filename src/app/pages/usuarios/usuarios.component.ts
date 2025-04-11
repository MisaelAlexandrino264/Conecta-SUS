import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent {
  constructor(private router: Router) {}

  irParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }
}
