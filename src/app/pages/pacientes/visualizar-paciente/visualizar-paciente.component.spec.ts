import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarPacienteComponent } from './visualizar-paciente.component';

describe('VisualizarPacienteComponent', () => {
  let component: VisualizarPacienteComponent;
  let fixture: ComponentFixture<VisualizarPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizarPacienteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizarPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});