import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from './login-modal.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    private modalController: ModalController,
    public authService: AuthService,
    ) {}

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent,
      cssClass: 'login-modal',
    });
    return await modal.present();
  }
  
  logout() {
    this.authService.logout();
  }
  
}
