import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  pergunta: string
  resposta: string

    constructor(private dataService: DataService) {}

    // openCards(cards){}

    async addCards() {
     this.dataService.addCards({ pergunta: this.pergunta, resposta: this.resposta });
    }
}
