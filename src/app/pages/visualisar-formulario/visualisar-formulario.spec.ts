import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualisarFormulario } from './visualisar-formulario';

describe('VisualisarFormulario', () => {
  let component: VisualisarFormulario;
  let fixture: ComponentFixture<VisualisarFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualisarFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualisarFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
