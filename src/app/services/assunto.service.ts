import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssuntoService {
  private assuntoSubject = new BehaviorSubject<string>('geral'); // Valor padrão

  setAssunto(assunto: string) {
    this.assuntoSubject.next(assunto);
  }

  getAssunto(): Observable<string> {
    return this.assuntoSubject.asObservable();
  }
}