import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private refreshSource = new BehaviorSubject<boolean>(false);
  refreshObservable = this.refreshSource.asObservable();

  refreshCards() {
    this.refreshSource.next(true);
  }
}