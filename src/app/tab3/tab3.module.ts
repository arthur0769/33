import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';
import { ReactiveFormsModule } from '@angular/forms';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { LoginModalComponent } from './login-modal.component';
import { EditarModalComponent } from './editar-modal.component';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    Tab3PageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [
    Tab3Page,
    LoginModalComponent,
    EditarModalComponent
  ]
})
export class Tab3PageModule {}
