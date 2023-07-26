import { Component } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../services/SharedService';


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
    private authService: AuthService,
    private router: Router,
    ) {}
    
    async addCards() {
      const hoje = new Date();
      const novaCarta = {
          pergunta: this.pergunta,
          resposta: this.resposta,
          data: hoje

      };
      
      await this.dataService.addCards(novaCarta);
      this.sharedService.refreshCards();
  }
  

} 
