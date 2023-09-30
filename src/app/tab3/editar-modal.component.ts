import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, Cards } from '../services/data.service';

@Component({
  selector: 'app-editar-modal',
  templateUrl: './editar-modal.component.html',
  styleUrls: ['./editar-modal.component.scss'],
})
export class EditarModalComponent {
  cards: Cards[] = [];

  constructor(private modalController: ModalController, private dataService: DataService) {}

  ionViewDidEnter() {
    this.carregarCards();
  }

  carregarCards() {
    this.dataService.getCards().subscribe((cards: Cards[]) => {
      this.cards = cards.map(card => ({...card, editando: false}));
    });
  }

  editarCard(card: Cards) {
    card.editando = true;
  }
  

  salvarEdicao(card: Cards) {
    card.editando = false;
    this.dataService.atualizarCard(card)
        .then(() => {
          this.carregarCards();
        })
        .catch((error: any) => {
          console.error("Erro ao atualizar card:", error);
        });
  }

  fecharModal() {
    this.modalController.dismiss();
  }
}