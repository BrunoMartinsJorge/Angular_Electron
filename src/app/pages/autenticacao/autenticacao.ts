import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-autenticacao',
  imports: [CommonModule, ButtonModule],
  templateUrl: './autenticacao.html',
  styleUrl: './autenticacao.css',
})
export class Autenticacao {
  constructor(private http: Auth, private router: Router) {}

  authenticateGoogle() {
    this.http.authenticate().subscribe({
      next: (response: any) => {
        window.open(response.urlAuth, '_blank', 'width=500,height=600');
        this.router.navigate(['/adicionar-formulario']);
        console.log(response);
      },
      error: (error: any) => {
        console.error('Erro no teste do Express:', error);
      },
    });
  }
}
