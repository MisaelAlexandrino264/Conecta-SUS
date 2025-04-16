import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CadastroPacienteComponent } from '../pacientes/cadastro-paciente/cadastro-paciente.component';
import { PacienteService, Paciente } from '../../services/paciente.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  tipoUsuario: string | null = null;
  displayedColumns: string[] = ['nome', 'dataNascimento', 'telefone', 'acoes'];
  dataSource = new MatTableDataSource<Paciente>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private pacienteService: PacienteService, private authService: AuthService) {}

  ngOnInit(): void {
    this.tipoUsuario = this.authService.getTipoUsuarioLocal();
    console.log('Tipo do usuário (local):', this.tipoUsuario);
  
    if (!this.tipoUsuario) {
      this.authService.getTipoUsuario().then(tipo => {
        this.tipoUsuario = tipo;
        console.log('Tipo carregado do Firestore:', tipo);
      });
    }
  
    this.carregarPacientes();
  }

  carregarPacientes() {
    this.pacienteService.obterPacientes().subscribe((pacientes: Paciente[]) => {
      this.dataSource.data = pacientes;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  

  abrirCadastroPaciente() {
    const dialogRef = this.dialog.open(CadastroPacienteComponent, { panelClass: 'modal-container' });

    dialogRef.afterClosed().subscribe(() => {
      this.carregarPacientes();
    });
  }

  editarPaciente(paciente: Paciente) {
    const dialogRef = this.dialog.open(CadastroPacienteComponent, {
      panelClass: 'modal-container',
      data: { paciente } 
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.carregarPacientes(); 
    });
  }  

  deletarPaciente(paciente: Paciente) {
    if (paciente.id) {
      Swal.fire({
        title: 'Tem certeza que deseja excluir?',
        text: 'Esta ação não pode ser desfeita!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.pacienteService.deletarPaciente(paciente.id!) 
            .then(() => {
              Swal.fire(
                'Excluído!',
                'O paciente foi removido com sucesso.',
                'success'
              );
              this.carregarPacientes();
            })
            .catch(error => {
              console.error('Erro ao deletar paciente:', error);
              Swal.fire(
                'Erro!',
                'Ocorreu um erro ao tentar deletar o paciente.',
                'error'
              );
            });
        }
      });
    } else {
      console.error('Paciente não possui um ID válido.');
    }
  }
  
  
  
}
