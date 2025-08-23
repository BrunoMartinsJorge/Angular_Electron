import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Navbar } from './shared/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Angular_Electron');
  public navbarAtiva: boolean = false;

  constructor(private router: Router) {}

  public ativarNavbar(): void {
    this.navbarAtiva = true;
  }

  public fecharNavbar(): void {
    this.navbarAtiva = false;
  }

  public isAuthenticated(): boolean {
    let isAuth = this.router.url !== '/';
    return isAuth;
  }
}
