import { Component, OnInit } from '@angular/core';
import { FormulariosServices } from '../../services/formularios-services';
import { Router } from '@angular/router';
import { Formulario } from '../../shared/models/formulario.model';

@Component({
  selector: 'app-visualisar-formulario',
  templateUrl: './visualisar-formulario.html',
  styleUrls: ['./visualisar-formulario.css'],
})

export class VisualisarFormulario implements OnInit {
  formulario!: Formulario;

  constructor(
    private formulariosService: FormulariosServices,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getFormByIdInUrl();
  }

  private getFormByIdInUrl(): void {
    
  }
}
