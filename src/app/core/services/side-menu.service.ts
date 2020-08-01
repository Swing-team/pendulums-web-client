import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SideMenuService {
  private isSideMenuActiveSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  changeIsSideMenuActive(state: boolean) {
    this.isSideMenuActiveSubject.next(state);
  }

  getIsSideMenuActiveAsObservable(): Observable<boolean> {
    return this.isSideMenuActiveSubject.asObservable();
  }

}