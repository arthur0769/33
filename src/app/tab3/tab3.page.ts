import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from './login-modal.component';
import { AuthService } from '../services/auth.service';

import { CloudModalComponent } from '../cloud-modal/cloud-modal.component';

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

    async openCloudModal() {
    const modal = await this.modalController.create({
      component: CloudModalComponent,
      cssClass: 'cloud-modal',
    });
    return await modal.present();
  }

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
