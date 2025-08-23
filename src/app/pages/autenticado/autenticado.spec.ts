import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Autenticado } from './autenticado';

describe('Autenticado', () => {
  let component: Autenticado;
  let fixture: ComponentFixture<Autenticado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Autenticado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Autenticado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
