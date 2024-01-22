import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, Cards } from '../services/data.service';
import { AssuntoService } from '../services/assunto.service';
import { AlertController } from '@ionic/angular';
import { SharedService } from '../services/SharedService';

@Component({
 selector: 'app-editar-modal',
 templateUrl: './editar-modal.component.html',
 styleUrls: ['./editar-modal.component.scss'],
})
export class EditarModalComponent {
 cards: Cards[] = [];
 cardsFiltradas: Cards[] = [];
 assuntoSelecionado: string = '';
 termoDePesquisa: string = '';

 constructor(
  private sharedService: SharedService,
  private modalController: ModalController,
  private dataService: DataService,
  private assuntoService: AssuntoService,
  private alertController: AlertController
 ) {
  this.assuntoService.getAssunto().subscribe((assunto: string) => {
    this.assuntoSelecionado = assunto;
    this.carregarCards();
  });
 }

 carregarCards() {
  this.dataService.getCards(this.assuntoSelecionado).subscribe((cards: Cards[]) => {
    this.cards = cards.map(card => ({...card, editando: false, assunto: this.assuntoSelecionado}));
    this.filtrarCards();
  });
 }

 editarCard(card: Cards) {
  card.editando = true;
 }

 excluirCard(card: Cards) {
  // Chama a função deleteCard do DataService passando o id da carta
  this.dataService.deleteCard(card.id)
    .then(() => {
      console.log('Card excluído com sucesso!');
      this.carregarCards(); // Recarrega a lista após a exclusão
    })
    .catch((error: any) => {
      console.error("Erro ao excluir card:", error);
    });
 }


 async excluirTodasCard() {
  const assunto = this.assuntoSelecionado;

  const confirmAlert = await this.alertController.create({
    header: 'Confirmar Exclusão',
    message: `Tem certeza que deseja excluir todas as cards do assunto "${assunto}"?`,
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Exclusão cancelada');
        }
      },
      {
        text: 'Excluir',
        handler: () => {
          this.dataService.deleteCardsByAssunto(assunto)
            .then(() => {
              console.log(`Todas as cards do assunto "${assunto}" foram excluídas com sucesso!`);
              this.carregarCards();
              this.sharedService.refreshCards();
            })
            .catch((error: any) => {
              console.error("Erro ao excluir cards:", error);
            });
        }
      }
    ]
  });

  await confirmAlert.present();
}

 salvarEdicao(card: Cards) {
  card.editando = false;
  this.dataService.atualizarCard(card)
    .then(() => {
      this.carregarCards();
      this.sharedService.refreshCards();
    })
    .catch((error: any) => {
      console.error("Erro ao atualizar card:", error);
    });
 }

 fecharModal() {
  this.modalController.dismiss();
  this.sharedService.refreshCards();
 }

 filtrarCards() {
  this.cardsFiltradas = this.cards.filter(card => card.assunto === this.assuntoSelecionado && card.pergunta.toLowerCase().includes(this.termoDePesquisa.toLowerCase()));
 }
}
