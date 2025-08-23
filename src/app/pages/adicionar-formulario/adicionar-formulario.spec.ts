import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarFormulario } from './adicionar-formulario';

describe('AdicionarFormulario', () => {
  let component: AdicionarFormulario;
  let fixture: ComponentFixture<AdicionarFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionarFormulario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdicionarFormulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
