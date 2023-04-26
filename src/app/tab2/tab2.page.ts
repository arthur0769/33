import { Component } from '@angular/core';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})


export class Tab2Page {

  public cardsEstudar: any[]
  public currentIndex = 0;
  

  constructor(private dataService: DataService) {

    this.cardsEstudar = [];
    

    this.dataService.getCardsHoje().subscribe(res => {
      this.cardsEstudar = res;
      console.log(this.cardsEstudar);
    })
  }

  public get currentCard() {
    return this.cardsEstudar[this.currentIndex];
  }

  public nextCard() {
    this.currentIndex = (this.currentIndex + 1) % this.cardsEstudar.length;
  }

  
  

}
  
