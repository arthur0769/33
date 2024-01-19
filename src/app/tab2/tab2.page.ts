import { Component, OnDestroy } from '@angular/core';
import { DataService, Cards } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { SharedService } from '../services/SharedService';
import { ModalController } from '@ionic/angular';
import { CloudModalComponent } from '../cloud-modal/cloud-modal.component';
import { AssuntoService } from '../services/assunto.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnDestroy {
  public cardsEstudar: any[] = [];
  public currentIndex = 0;
  private uidSubscription?: Subscription;

  startX: number = 0;
  endX: number = 0;
  startY: number = 0;
  endY: number = 0;

  private _assunto: string;

  get assunto(): string {
    return this._assunto;
  }

  set assunto(value: string) {
    this._assunto = value;
    this.refreshCards();
  }

  constructor(
    private sharedService: SharedService,
    private dataService: DataService,
    public authService: AuthService,
    private modalController: ModalController,
    private assuntoService: AssuntoService
  ) {
    this.sharedService.refreshObservable.subscribe(shouldRefresh => {
      if (shouldRefresh) {
        this.refreshCards();
      }
    });
  }

  async openCloudModal() {
    const modal = await this.modalController.create({
      component: CloudModalComponent,
      cssClass: 'cloud-modal',
    });
    return await modal.present();
  }

  ngOnDestroy() {
    if (this.uidSubscription) {
      this.uidSubscription.unsubscribe();
    }
  }

  refreshCards() {
    this.dataService.getCardsHoje(this.assunto).subscribe((cards: { id: string; data: Cards; assunto: string }[]) => {
      this.cardsEstudar = [...cards];
      if (this.cardsEstudar.length > 0) {
        this.currentIndex = 0;
      }
    });
  }


  ngOnInit() {
    this.assuntoService.getAssunto().subscribe((assunto) => {
      this.assunto = assunto;
      this.refreshCards();
    });
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
    let cardElement = document.getElementById("card-" + index);
  
    if (cardElement) {
      let deltaX = this.startX - evt.touches[0].pageX;
      let deltaY = this.startY - evt.touches[0].pageY;
      let deg = deltaX / 10;
      
      // Adicione um fator de ajuste para controlar a "peso" da animação
      let adjustmentFactor = 0.3;
      let adjustedDeltaX = deltaX * adjustmentFactor;
      let adjustedDeltaY = deltaY * adjustmentFactor;
  
      this.endX = evt.touches[0].pageX;
      this.endY = evt.touches[0].pageY;
  
      // Swipe gesture
      cardElement.style.transform = `translate(${ -adjustedDeltaX }px, ${ -adjustedDeltaY }px) rotate(${ -deg }deg)`;
  
      if ((this.endX - this.startX) < 0) {
        // show dislike icon
        let rejectIcon = document.getElementById("reject-icon");
        if (rejectIcon) {
          rejectIcon.style.opacity = String(adjustedDeltaX / 100);
        }
      } else {
        let acceptIcon = document.getElementById("accept-icon");
        if (acceptIcon) {
          acceptIcon.style.opacity = String(-adjustedDeltaX / 100);
        }
      }
    }
  }  
  

  touchEnd(index: number) {
    if (this.endX > 0) {
      let finalX = this.endX - this.startX;
      let finalY = this.endY - this.startY;

      if (Math.abs(finalX) < 100 && Math.abs(finalY) < 100) {
        this.resetCardPosition(index);
      } else if (finalX <= -100) {
        this.handleSwipe(index, -30, -1000, 5);
      } else if (finalX >= 100) {
        this.handleSwipe(index, 30, 1000, 3);
      } else if (finalY <= -100) {
        this.handleSwipe(index, -30, -1000, 1);
      } else if (finalY >= 100) {
        this.handleSwipe(index, 30, 1000, 0);
      } else {
        this.resetCardPosition(index);
      }

      this.resetAll();
    }
  }

  private updateCardTransform(index: number, translateX: number, translateY: number, rotateDeg: number) {
    const cardElement = document.getElementById(`card-${index}`);
    if (cardElement) {
      cardElement.style.transition = '0s';
      cardElement.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotateDeg}deg)`;
    }
  }

  private updateIconOpacity(iconId: string, opacityValue: number) {
    const iconElement = document.getElementById(iconId);
    if (iconElement) {
      iconElement.style.opacity = String(opacityValue / 100);
    }
  }

  private resetCardPosition(index: number) {
    const cardElement = document.getElementById(`card-${index}`);
    if (cardElement) {
      cardElement.style.transition = '.3s';
      cardElement.style.transform = 'translateX(0px) rotate(0deg)';

      setTimeout(() => {
        cardElement.style.transition = '0s';
      }, 350);
    }
  }

  private handleSwipe(index: number, rotateDeg: number, translateX: number, days: number) {
    const currentCard = this.cardsEstudar[index];
    
    if (currentCard) {
      this.updateCardTransform(index, translateX, 0, rotateDeg);
      this.updateCardData(currentCard, days);
  
      setTimeout(() => {
        this.cardsEstudar = this.cardsEstudar.filter(card => card.id !== currentCard.id);
        this.refreshCards();
      }, 10);
    }
  }
  
  private updateCardData(card: any, days: number) {
    if (card) {
      if (this.authService.uid) {
        this.dataService.updateCardData(card.id, card.data, days).subscribe(() => {
        });
      } else {
        this.dataService.updateLocalCardData(card.id, card.data, days);
      }
    }
  }
  
  

  private resetAll() {
    this.startX = 0;
    this.endX = 0;
    this.startY = 0;
    this.endY = 0;
    this.updateIconOpacity('reject-icon', 0);
    this.updateIconOpacity('accept-icon', 0);
  }
  

  adicionar5Dias() {
    const currentCard = this.cardsEstudar[this.currentIndex];
    if (currentCard) {
      if (this.authService.uid) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 5).subscribe(() => {
          this.refreshCards();
        });
      } else {
        this.dataService.updateLocalCardData(currentCard.id, currentCard.data, 5);
        this.refreshCards();
      }
    }
  }

  adicionar3Dias() {
    const currentCard = this.cardsEstudar[this.currentIndex];
    if (currentCard) {
      if (this.authService.uid) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 3).subscribe(() => {
          this.refreshCards();
        });
      } else {
        this.dataService.updateLocalCardData(currentCard.id, currentCard.data, 3);
        this.refreshCards();
      }
    }
  }
  
  adicionar1Dia() {
    const currentCard = this.cardsEstudar[this.currentIndex];
    if (currentCard) {
      if (this.authService.uid) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 1).subscribe(() => {
          this.refreshCards();
        });
      } else {
        this.dataService.updateLocalCardData(currentCard.id, currentCard.data, 1);
        this.refreshCards();
      }
    }
  }
}