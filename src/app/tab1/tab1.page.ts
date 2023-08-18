import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/SharedService';

import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})

export class Tab1Page {
    profile = null;
    pergunta: string;
    resposta: string;
  
    constructor(
        private sharedService: SharedService,
        private dataService: DataService, 
        public authService: AuthService,
        private router: Router,
        private popoverCtrl: PopoverController,
    ) {}
    
    async addCards() {
        const novaCarta = {
            pergunta: this.pergunta,
            resposta: this.resposta,
            data: new Date().toISOString()
        };
        
        await this.dataService.addCards(novaCarta);
        this.sharedService.refreshCards();
    }

}