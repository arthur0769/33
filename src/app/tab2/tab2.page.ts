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
      console.log(this.cardsEstudar)
    });
  }

  public get currentCard() {
    return this.cardsEstudar[this.currentIndex];
  }

  revelarResposta(cardId: string) {
    const respostaEmbarcada = document.querySelector(`#${cardId} .resposta-embacada`) as HTMLElement;
    respostaEmbarcada.style.filter = 'blur(0)';
  }

  static adicionarDias(data: string, dias: number): string {
    const dataSplit = data.split('-');
    const dataAtual = new Date(Number(dataSplit[2]), Number(dataSplit[1]) - 1, Number(dataSplit[0]));
    dataAtual.setDate(dataAtual.getDate() + dias);
    return dataAtual.toLocaleDateString('pt-BR');
}


marcarComoFacil() {
  const card = this.currentCard;
  const novaData = Tab2Page.adicionarDias(card.data, 3);
  this.dataService.atualizarCard(card.id, { pergunta: card.pergunta, resposta: card.resposta, data: novaData }); // Inclua a propriedade data no objeto literal
  this.currentIndex++;
}











  
}
