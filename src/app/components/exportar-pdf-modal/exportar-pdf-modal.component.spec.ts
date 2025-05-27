import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportarPdfModalComponent } from './exportar-pdf-modal.component';

describe('ExportarPdfModalComponent', () => {
  let component: ExportarPdfModalComponent;
  let fixture: ComponentFixture<ExportarPdfModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportarPdfModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExportarPdfModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
