import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/SharedService';
import { ModalController } from '@ionic/angular';
import { CloudModalComponent } from '../cloud-modal/cloud-modal.component';
import { Renderer2 } from '@angular/core';
import { AssuntoService } from '../services/assunto.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
  profile = null;
  pergunta: string;
  resposta: string;

  private _assunto: string = "geral";
  
  get assunto(): string {
    return this._assunto;
  }

  set assunto(value: string) {
    this._assunto = value;
    this.updatePrimaryColor();
  }
  

  constructor(
    private sharedService: SharedService,
    private dataService: DataService,
    public authService: AuthService,
    private modalController: ModalController,
    private router: Router,
    private renderer: Renderer2,
    private assuntoService: AssuntoService
  ) {}

  async addCards() {
    const novaCarta = {
      pergunta: this.pergunta,
      resposta: this.resposta,
      assunto: this.assunto,
      data: new Date().toISOString(),
    };

    await this.dataService.addCards(novaCarta);
    this.sharedService.refreshCards();

    // Limpar os campos de pergunta e resposta após adicionar a carta
    this.pergunta = '';
    this.resposta = '';
  }

  async openCloudModal() {
    const modal = await this.modalController.create({
      component: CloudModalComponent,
      cssClass: 'cloud-modal',
    });
    return await modal.present();
  }

  ngOnInit() {
    this.updatePrimaryColor(); 
  }
  
  updatePrimaryColor() {
    let primaryColor = '';
    let primaryColorDark = '';
  
    switch (this.assunto) {
      case 'geral':
        primaryColor = '#000000';
        primaryColorDark = '#ffffff';
        break;
      case 'ingles':
        primaryColor = '#00a5b4';
        primaryColorDark = '#00a5b4';
        break;
      case 'espanhol':
        primaryColor = '#f5c400';
        primaryColorDark = '#f5c400';
        break;
      default:
        primaryColor = '#000000';
        primaryColorDark = '#ffffff';
        break;
    }
  
    // Atualize as variáveis CSS
    document.documentElement.style.setProperty('--ion-color-primary', primaryColor);
    document.documentElement.style.setProperty('--ion-color-primary-dark', primaryColorDark);
  }
}
