import { Component } from '@angular/core';
import { Cards, DataService } from '../services/data.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})

export class Tab2Page {
  public cardsEstudar: any[] = [];
  public currentIndex = 0;
  
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getCardsHoje().subscribe((cards: {id: string, data: Cards}[]) => {
      this.cardsEstudar = cards;
      if (this.cardsEstudar.length > 0) {
        this.currentIndex = 0;
      }
    });
  }
  

  public get currentCard() {
    return this.cardsEstudar[this.currentIndex];
  }
  

  
    adicionar5Dias() {
      const currentCard = this.cardsEstudar[this.currentIndex];
      if (currentCard) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 5).subscribe(() => {
          const novaData = new Date(currentCard.data.seconds * 1000 + currentCard.data.nanoseconds / 1000000);
          novaData.setDate(novaData.getDate() + 5);
          this.cardsEstudar[this.currentIndex] = { ...currentCard, data: novaData };
          if (this.currentIndex < this.cardsEstudar.length - 1) {
            this.currentIndex++;
            console.log(this.currentIndex)
          }
        });
      }
  }

  adicionar3Dias() {
      const currentCard = this.cardsEstudar[this.currentIndex];
      if (currentCard) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 3).subscribe(() => {
          const novaData = new Date(currentCard.data.seconds * 1000 + currentCard.data.nanoseconds / 1000000);
          novaData.setDate(novaData.getDate() + 3);
          this.cardsEstudar[this.currentIndex] = { ...currentCard, data: novaData };
          if (this.currentIndex < this.cardsEstudar.length - 1) {
            this.currentIndex++;
            console.log(this.currentIndex)
          }
        });
      }
  }

  adicionar1Dia() {
      const currentCard = this.cardsEstudar[this.currentIndex];
      if (currentCard) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 1).subscribe(() => {
          const novaData = new Date(currentCard.data.seconds * 1000 + currentCard.data.nanoseconds / 1000000);
          novaData.setDate(novaData.getDate() + 1);
          this.cardsEstudar[this.currentIndex] = { ...currentCard, data: novaData };
          if (this.currentIndex < this.cardsEstudar.length - 1) {
            this.currentIndex++;
            console.log(this.currentIndex)
          }
        });
      }
  }

}
