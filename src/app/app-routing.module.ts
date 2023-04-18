import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
