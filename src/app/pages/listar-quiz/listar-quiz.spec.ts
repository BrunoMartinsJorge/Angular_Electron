import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarQuiz } from './listar-quiz';

describe('ListarQuiz', () => {
  let component: ListarQuiz;
  let fixture: ComponentFixture<ListarQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
