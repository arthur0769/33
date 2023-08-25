import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/SharedService';
import { ModalController } from '@ionic/angular';

import { PopoverController } from '@ionic/angular';

import { CloudModalComponent } from '../cloud-modal/cloud-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
    profile = null;
    pergunta: string;
    resposta: string;
    assunto: string = "geral";
  
    constructor(
        private sharedService: SharedService,
        private dataService: DataService, 
        public authService: AuthService,
        private modalController: ModalController,
        private router: Router,
        private popoverCtrl: PopoverController,
    ) {}
    
    async addCards() {
        const novaCarta = {
            pergunta: this.pergunta,
            resposta: this.resposta,
            assunto: this.assunto,
            data: new Date().toISOString()
        };
        
        await this.dataService.addCards(novaCarta);
        this.sharedService.refreshCards();
    }

    async openCloudModal() {
        const modal = await this.modalController.create({
          component: CloudModalComponent,
          cssClass: 'cloud-modal',
        });
        return await modal.present();
      }


}