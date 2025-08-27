import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../core/environments/environment';
import { NewForm } from '../pages/adicionar-formulario/forms/NewForm';
import { Formulario } from '../shared/models/formulario.model';

@Injectable({
  providedIn: 'root',
})
export class FormulariosServices {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public criarFormulario(formulario: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/forms`, formulario);
  }

  public criarQuiz(quiz: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/quiz`, quiz);
  }

  public listarFormularios(): Observable<Formulario[]>{
    return this.http.get<Formulario[]>(`${this.baseUrl}/api/forms`);
  }

  public deletarFormulario(formId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/forms/${formId}`);
  }

  public buscarRespostasDeFormularioPorIdForm(formId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/forms/${formId}/responses`);
  }

  public buscarQuestoesDeFormularioPorIdForm(formId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/forms/quest/${formId}`);
  }
}
