import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarQuestao } from './visualizar-questao';

describe('VisualizarQuestao', () => {
  let component: VisualizarQuestao;
  let fixture: ComponentFixture<VisualizarQuestao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarQuestao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizarQuestao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
