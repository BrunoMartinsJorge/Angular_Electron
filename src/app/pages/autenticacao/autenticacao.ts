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
    this.http.loginWithGoogle()
      .then(() => {
        this.router.navigate(['/adicionar-formulario']);
      })
      .catch(err => console.error('Erro ao autenticar:', err));
  }
}
