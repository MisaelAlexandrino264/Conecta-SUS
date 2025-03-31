import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CadastroPacienteComponent } from '../pacientes/cadastro-paciente/cadastro-paciente.component';
import { PacienteService, Paciente } from '../../services/paciente.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'cpf', 'telefone', 'email', 'acoes'];
  dataSource = new MatTableDataSource<Paciente>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private pacienteService: PacienteService) {}

  ngOnInit(): void {
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
      data: { paciente } // Passa o paciente como dado para o diálogo
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.carregarPacientes(); // Recarrega a lista após editar
    });
  }  

  deletarPaciente(paciente: Paciente) {
    if (paciente.id) {
      this.pacienteService.deletarPaciente(paciente.id).then(() => {
        alert('Paciente deletado com sucesso!');
        this.carregarPacientes();
      }).catch(error => {
        console.error('Erro ao deletar paciente:', error);
      });
    } else {
      console.error('Paciente não possui um ID válido.');
    }
  }
  
}
