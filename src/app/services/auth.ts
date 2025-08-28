import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../core/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public loginWithGoogle(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.authenticate().subscribe({
        next: (response) => {
          const popup = window.open(
            response.urlAuth,
            '_blank',
            'width=500,height=600'
          );

          const listener = (event: MessageEvent) => {
            // 🔹 Detecta se está no Electron
            const isElectron = !!(
              window &&
              (window as any).process &&
              (window as any).process.type
            );

            // 🔹 Define a origem permitida
            const allowedOrigin = isElectron ? 'null' : 'http://localhost:3000';

            // 🔹 Valida a origem (no Electron geralmente vem "null")
            if (event.origin !== allowedOrigin && allowedOrigin !== 'null')
              return;

            // 🔹 Continua se recebeu token
            const token = event.data?.token;
            if (token) {
              localStorage.setItem('googleToken', JSON.stringify(token));
              resolve(token);
              window.removeEventListener('message', listener);
            }
          };

          window.addEventListener('message', listener);
        },
        error: (err) => reject(err),
      });
    });
  }

  private authenticate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/google`);
  }
}
