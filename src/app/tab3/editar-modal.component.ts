import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, Cards } from '../services/data.service';
import { AssuntoService } from '../services/assunto.service';

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
  private modalController: ModalController,
  private dataService: DataService,
  private assuntoService: AssuntoService
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
  this.cardsFiltradas = this.cards.filter(card => card.assunto === this.assuntoSelecionado && card.pergunta.toLowerCase().includes(this.termoDePesquisa.toLowerCase()));
 }
}
