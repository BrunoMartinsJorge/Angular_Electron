import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../core/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  public authenticate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/google`);
  }
}
