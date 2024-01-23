import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  hidenSkeleton = false;

  constructor(
  ) {

    setTimeout(() => {
      this.hidenSkeleton = true;
   }, 1500);
    
  }

}
