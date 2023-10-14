import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.register(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.dismissModal();
      // Faça alguma ação após o registro, se necessário
    } else {
      this.showAlert('Seu cadastro falhou', 'este email já foi cadastrado');
    }
  }

  async login() {
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.login(this.credentials.value);
    await loading.dismiss();

    if (user) {
      this.dismissModal();
      // Faça alguma ação após o login, se necessário
    } else {
      this.showAlert('Seu login falhou', 'Por favor tente novamente!');
    }
  }

  async showAlert(header: any, message: any) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }


  async forgotPassword() {
    const prompt = await this.alertController.create({
      header: 'Esqueci minha senha',
      message: "Digite seu endereço de e-mail para redefinir sua senha:",
      inputs: [
        {
          name: 'email',
          placeholder: 'E-mail',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enviar',
          handler: async data => {
            const loading = await this.loadingController.create();
            await loading.present();
  
            try {
            await this.authService.resetPassword(data.email);
  
              // Exiba uma mensagem de sucesso
              this.showAlert('Sucesso', 'Um e-mail de redefinição de senha foi enviado para o seu endereço de e-mail.');
            } catch (error) {
              // Exiba uma mensagem de erro se a redefinição de senha falhar
              this.showAlert('Erro', 'Ocorreu um erro ao redefinir a senha. Por favor, tente novamente mais tarde.');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await prompt.present();
  }
  


  dismissModal() {
    this.modalController.dismiss();
  }



}
