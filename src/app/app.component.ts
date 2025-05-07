import { Component } from '@angular/core';
import { VigenereComponent } from './components/vigenere/vigenere.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VigenereComponent],
  template: '<app-vigenere></app-vigenere>',
})
export class AppComponent {
  title = 'Шифр Виженера';
}
