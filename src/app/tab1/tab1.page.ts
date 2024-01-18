import { Component } from '@angular/core';
import { Cards, DataService } from '../services/data.service';
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
  cards: { editando: boolean; assunto: string; id?: string | undefined; uid?: string | null | undefined; pergunta: string; resposta: string; data: string; }[];
  
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
      editando : false
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

  updateAssunto(newAssunto: string) {
    this.assunto = newAssunto;
    // Atualize o assunto no serviço sempre que o usuário o alterar
    this.assuntoService.setAssunto(this.assunto);
  
    // Chame a função para carregar os cards do novo assunto selecionado
    this.dataService.getCardsHoje(this.assunto).subscribe((cards: { id: string; data: Cards; assunto: string }[]) => {
      this.cards = cards.map(card => ({...card.data, editando: false}));
    });
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
        primaryColor = '#ff0000';
        primaryColorDark = '#ff0000';
        break;
      case 'espanhol':
        primaryColor = '#ffff00';
        primaryColorDark = '#ffff00';
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
