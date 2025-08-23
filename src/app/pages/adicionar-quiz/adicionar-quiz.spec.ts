import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionarQuiz } from './adicionar-quiz';

describe('AdicionarQuiz', () => {
  let component: AdicionarQuiz;
  let fixture: ComponentFixture<AdicionarQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionarQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdicionarQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
