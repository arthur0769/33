import { Component, ViewChild } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-cloud-modal',
  templateUrl: './cloud-modal.component.html',
  styleUrls: ['./cloud-modal.component.scss'],
})
export class CloudModalComponent {
  constructor(private modalController: ModalController) {}

  dismissModal() {
    this.modalController.dismiss();
  }
}