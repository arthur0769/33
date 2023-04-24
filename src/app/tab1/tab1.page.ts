import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AlertController } from '@ionic/angular';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {

  pergunta: string;
  resposta: string;
  
  constructor(private dataService: DataService) {}
  
  async addCards() {
    const hoje = new Date();
    const novaCarta = {
      pergunta: this.pergunta,
      resposta: this.resposta,
      data: `${hoje.getDate()}-${hoje.getMonth() + 1}-${hoje.getFullYear()}`
    };
    await this.dataService.addCards(novaCarta);
  }
} 
