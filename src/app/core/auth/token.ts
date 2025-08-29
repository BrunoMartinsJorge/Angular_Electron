import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Token {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  public getAuthToken(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/google`);
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const res: any = await this.http.get('/validate-token').toPromise();
      return res.valid;
    } catch (err) {
      return false;
    }
  }
}
