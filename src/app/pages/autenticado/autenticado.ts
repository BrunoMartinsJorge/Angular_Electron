import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-autenticado',
  imports: [],
  templateUrl: './autenticado.html',
  styleUrl: './autenticado.css',
})
export class Autenticado implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        localStorage.setItem('authToken', token);
        this.router.navigate(['/listar-formularios']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
