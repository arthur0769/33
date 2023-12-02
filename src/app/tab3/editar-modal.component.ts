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
  termoDePesquisa: string = '';

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

  excluirCard(card: Cards) {
    this.dataService.excluirCard(card)
      .then(() => {
        this.carregarCards();
      })
      .catch((error: any) => {
        console.error("Erro ao excluir card:", error);
      });
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

  filtrarCards() {
    const termo = this.termoDePesquisa.toLowerCase();

    if (termo.trim() === '') {
      // Se o campo de pesquisa estiver vazio, mostrar todas as cards
      this.carregarCards();
    } else {
      // Filtrar cards com base no termo de pesquisa
      this.cards = this.cards.filter(card => {
        return card.pergunta.toLowerCase().includes(termo) || card.resposta.toLowerCase().includes(termo);
      });
    }
  }
}
