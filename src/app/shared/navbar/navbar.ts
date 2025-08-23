import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

declare global {
  interface Window {
    electronAPI: {
      getUsers: () => Promise<{ id: number; name: string }[]>;
      addUser: (name: string) => Promise<{ id: number; name: string }>;
    };
  }
}

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
}
