import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VigenereService } from '../../services/vigenere.service';
import { CyrillicHighlightDirective } from '../../directive/hilight.directive';

@Component({
  selector: 'app-vigenere',
  templateUrl: './vigenere.component.html',
  styleUrls: ['./vigenere.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CyrillicHighlightDirective],
})
export class VigenereComponent {
  @ViewChild('textInput') textInput!: ElementRef;
  cipherForm: FormGroup;
  result: string = '';
  foundKey: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private vigenereService: VigenereService
  ) {
    this.cipherForm = this.fb.group({
      text: ['', [Validators.required, Validators.pattern(/^[а-яА-ЯёЁ\s]*$/)]],
      key: ['', [Validators.pattern(/^[а-яА-ЯёЁ\s]*$/)]],
      operation: ['encrypt', Validators.required],
    });

    this.cipherForm.get('operation')?.valueChanges.subscribe((operation) => {
      const keyControl = this.cipherForm.get('key');
      if (operation === 'crack') {
        keyControl?.clearValidators();
      } else {
        keyControl?.setValidators([
          Validators.required,
          Validators.pattern(/^[а-яА-ЯёЁ]*$/),
        ]);
      }
      keyControl?.updateValueAndValidity();
    });
  }

  onTextChange() {
    const text = this.textInput.nativeElement.innerText;
    this.cipherForm.patchValue({ text });
  }

  onSubmit() {
    if (this.cipherForm.valid) {
      const text = this.textInput.nativeElement.innerText;
      const { key, operation } = this.cipherForm.value;
      this.error = '';
      this.foundKey = '';

      try {
        switch (operation) {
          case 'encrypt':
            this.result = this.vigenereService.encrypt(text, key);
            break;
          case 'decrypt':
            this.result = this.vigenereService.decrypt(text, key);
            break;
          case 'crack':
            const crackResult = this.vigenereService.crack(text);
            this.result = crackResult.decryptedText;
            this.foundKey = crackResult.key;
            break;
        }
      } catch (err) {
        this.error = 'Произошла ошибка при обработке текста';
        this.result = '';
        this.foundKey = '';
      }
    } else {
      this.error = 'Пожалуйста, проверьте правильность ввода';
    }
  }

  clearForm() {
    this.cipherForm.reset({ operation: 'encrypt' });
    this.textInput.nativeElement.innerText = '';
    this.result = '';
    this.foundKey = '';
    this.error = '';
  }
}
