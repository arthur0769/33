import { Component, OnDestroy } from '@angular/core';
import { Cards, DataService } from '../services/data.service';
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
  public isVisible: boolean[] = [];
  private uidSubscription?: Subscription;
  
  startX: number = 0;
  endX: number = 0;
  startY: number = 0;
  endY: number = 0;

  private _assunto: string; // Adicione a declaração da variável _assunto

  get assunto(): string {
    return this._assunto;
  }

  set assunto(value: string) {
    this._assunto = value;
    this.refreshCards()
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
    // Use o valor atualizado do assunto para buscar os cards
    this.dataService.getCardsHoje(this.assunto).subscribe((cards: { id: string; data: Cards; assunto: string }[]) => {
      this.cardsEstudar = [...cards]; // Criando uma nova instância
      if (this.cardsEstudar.length > 0) {
        this.currentIndex = 0;
      }
    });
    console.log(this.cardsEstudar)
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
      if (this.authService.uid) {
        this.dataService.updateCardData(currentCard.id, currentCard.data, 5).subscribe(() => {
          this.refreshCards();
        });
      } else {
        const novaData = new Date(currentCard.data);
        novaData.setDate(novaData.getDate() + 5);
        this.dataService.updateLocalCardData(currentCard.id, currentCard.data, 5);
        this.cardsEstudar[this.currentIndex].data = novaData.toISOString();
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
        const novaData = new Date(currentCard.data);
        novaData.setDate(novaData.getDate() + 3);
        this.dataService.updateLocalCardData(currentCard.id, currentCard.data, 3);
        this.cardsEstudar[this.currentIndex].data = novaData.toISOString();
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