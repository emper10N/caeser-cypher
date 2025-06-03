import { Component } from '@angular/core';
import { CaesarCipherComponent } from './components/caesar-cipher/caesar-cipher.component';
import { VigenereComponent } from './components/vigenere/vigenere.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CaesarCipherComponent, VigenereComponent],
  template:
    '<app-caesar-cipher></app-caesar-cipher><app-vigenere></app-vigenere>',
})
export class AppComponent {
  title = 'Шифр Виженера';
}
