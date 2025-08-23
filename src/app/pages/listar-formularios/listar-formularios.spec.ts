import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFormularios } from './listar-formularios';

describe('ListarFormularios', () => {
  let component: ListarFormularios;
  let fixture: ComponentFixture<ListarFormularios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarFormularios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarFormularios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
