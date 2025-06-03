import { Routes } from '@angular/router';
import { VigenereComponent } from './components/vigenere/vigenere.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/caesar-cipher/caesar-cipher.component').then(
        (m) => m.CaesarCipherComponent
      ),
  },
  {
    path: 'vigenere',
    loadComponent: () =>
      import('./components/vigenere/vigenere.component').then(
        (m) => m.VigenereComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
