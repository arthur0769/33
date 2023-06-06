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
  public isVisible: boolean[] = [];

  startX: number = 0; // starting point of the swipe
  endX: number = 0; // ending point of the swipe
  startY: number = 0; // starting point of the swipe on Y axis
  endY: number = 0; // ending point of the swipe on Y axis

  constructor(private dataService: DataService) {}

  private refreshCards() {
    this.dataService.getCardsHoje().subscribe((cards: { id: string; data: Cards }[]) => {
      this.cardsEstudar = cards;
      if (this.cardsEstudar.length > 0) {
        this.currentIndex = 0;
      }
    });
  }

  ngOnInit() {
    this.refreshCards();
  }

  toggleAnswer(cardId: string) {
    const card = this.cardsEstudar.find((c) => c.id === cardId);
    if (card) {
      card.showAnswer = !card.showAnswer;
    }
  }

  public get currentCard() {
    return this.cardsEstudar[this.currentIndex];
  }

  touchStart(evt: any) {
    this.startX = evt.touches[0].pageX;
    this.startY = evt.touches[0].pageY;
  }

  touchMove(evt: any, index: number) {
    let deltaX = this.startX - evt.touches[0].pageX;
    let deltaY = this.startY - evt.touches[0].pageY;
    let deg = deltaX / 10;
    this.endX = evt.touches[0].pageX;
    this.endY = evt.touches[0].pageY;

    // Swipe gesture
    document.getElementById("card-" + index)!.style.transform = `translate(${ -deltaX }px, ${ -deltaY }px) rotate(${ -deg }deg)`;

    if ((this.endX - this.startX) < 0) {
      // show dislike icon
      document.getElementById("reject-icon")!.style.opacity = String(deltaX / 100);
    } else {
      document.getElementById("accept-icon")!.style.opacity = String(-deltaX / 100);
    }
  }

  touchEnd(index: number) {
    if (this.endX > 0) {
      // to avoid removing card on click
      let finalX = this.endX - this.startX;
      let finalY = this.endY - this.startY;

      if (finalX > -100 && finalX < 100) {
        // reset card back to position
        document.getElementById("card-" + index)!.style.transition = ".3s";
        document.getElementById("card-" + index)!.style.transform = "translateX(0px) rotate(0deg)";

        // remove transition after 350 ms
        setTimeout(() => {
          document.getElementById("card-" + index)!.style.transition = "0s";
        }, 350);
      } else if (finalX <= -100) {
        // Arrasta pra esquerda
        document.getElementById("card-" + index)!.style.transition = "1s";
        document.getElementById("card-" + index)!.style.transform = "translateX(-1000px) rotate(-30deg)";
        this.adicionar1Dia();

        // remove user from users array
        setTimeout(() => {
          this.cardsEstudar.splice(index, 1);
        }, 10);
      } else if (finalX >= 100) {
        // Arrasta pra direita
        document.getElementById("card-" + index)!.style.transition = "1s";
        document.getElementById("card-" + index)!.style.transform = "translateX(1000px) rotate(30deg)";
        this.adicionar3Dias();

        // remove user from users array
        setTimeout(() => {
          this.cardsEstudar.splice(index, 1);
        }, 100);
      }

      if (this.endY > 0) {
        // to avoid removing card on click
        let finalY = this.endY - this.startY;

        if (finalY > -100 && finalY < 100) {
          // reset card back to position
          document.getElementById("card-" + index)!.style.transition = ".3s";
          document.getElementById("card-" + index)!.style.transform = "translateX(0px) rotate(0deg)";

          // remove transition after 350 ms
          setTimeout(() => {
            document.getElementById("card-" + index)!.style.transition = "0s";
          }, 350);
        } else if (finalY <= -100) {
          // Arrasta pra cima
          document.getElementById("card-" + index)!.style.transition = "1s";
          document.getElementById("card-" + index)!.style.transform = "translateY(-1000px) rotate(-30deg)";
          this.adicionar5Dias();

          // remove user from users array
          setTimeout(() => {
            this.cardsEstudar.splice(index, 1);
          }, 100);
        } else if (finalY >= 100) {
          // Arrasta pra baixo
          document.getElementById("card-" + index)!.style.transition = "1s";
          document.getElementById("card-" + index)!.style.transform = "translateY(1000px) rotate(30deg)";

          // remove user from users array
          setTimeout(() => {
            this.cardsEstudar.splice(index, 1);
          }, 100);
        }
      }

      // reset all
      this.startX = 0;
      this.endX = 0;
      this.startY = 0;
      this.endY = 0;
      document.getElementById("reject-icon")!.style.opacity = "0";
      document.getElementById("accept-icon")!.style.opacity = "0";
    }
  }

  adicionar5Dias() {
    const currentCard = this.cardsEstudar[this.currentIndex];
    if (currentCard) {
      this.dataService.updateCardData(currentCard.id, currentCard.data, 5).subscribe(() => {
        const novaData = new Date(currentCard.data.seconds * 1000 + currentCard.data.nanoseconds / 1000000);
        novaData.setDate(novaData.getDate() + 5);
        this.cardsEstudar[this.currentIndex] = { ...currentCard, data: novaData };
        this.refreshCards();
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
        this.refreshCards();
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
        this.refreshCards();
      });
    }
  }
}
