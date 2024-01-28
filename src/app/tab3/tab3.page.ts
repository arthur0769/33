import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from './login-modal.component';
import { AuthService } from '../services/auth.service';
import { CloudModalComponent } from '../cloud-modal/cloud-modal.component';
import { EditarModalComponent } from './editar-modal.component';
import { DataService } from '../services/data.service';
import * as JSZip from 'jszip';
import { SharedService } from '../services/SharedService';
import { AssuntoService } from '../services/assunto.service';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(
    private assunto: AssuntoService,
    private sharedService: SharedService,
    private modalController: ModalController,
    public authService: AuthService,
    private dataService: DataService,
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

  async openEditarModal() {
    const modal = await this.modalController.create({
      component: EditarModalComponent,
      cssClass: 'editar-modal',
    });
    return await modal.present();
  }


  arquivoSelecionado: File; // Você pode armazenar o arquivo selecionado aqui

  async onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      const arquivo: File = inputElement.files[0];
      const leitor = new FileReader();
  
      leitor.onload = async (e) => {

        let assuntoAtual = 'geral'
        this.assunto.getAssunto().subscribe(assunto => {
            assuntoAtual = assunto
        });

        try {
          const conteudo: string = leitor.result as string;
          const linhas: string[] = conteudo.split('\n');
  
          for (const linha of linhas) {
            const [pergunta, resposta] = linha.split('\t');
            if (pergunta && resposta) {
              const novoCard = {
                pergunta: pergunta.trim(),
                resposta: resposta.trim(),
                assunto: assuntoAtual,
                data: new Date().toISOString(),
                editando: false
              };

              this.dataService.addCards(novoCard)
                .then(() => {
                  console.log("Novo card importado com sucesso!");
                })
                .catch(error => {
                  console.error("Erro ao adicionar o novo card:", error);
                });
            }
          }
  
          console.log("Importação do Anki concluída com sucesso!");
        } catch (erro) {
          console.error("Erro durante a importação do Anki:", erro);
        }
      };
  
      leitor.readAsText(arquivo);
    } else {
      console.error('Nenhum arquivo selecionado para importação.');
    }
  }
  
  

  importarCards() {
    if (this.arquivoSelecionado) {
      this.dataService.importarCardsDoAnki(this.arquivoSelecionado)
        .then(() => {
          console.log("Importação do Anki concluída com sucesso!");
        })
        .catch(error => {
          console.error("Erro durante a importação do Anki:", error);
        });
    } else {
      console.error("Nenhum arquivo selecionado para importação.");
    }
  }
  
  logout() {
    this.authService.logout();
  }

  
}
