import { Component, ViewChild, ElementRef } from '@angular/core';
import { CaesarService } from '../../services/caesar.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CyrillicHighlightDirective } from '../../directive/hilight.directive';

@Component({
  selector: 'app-caesar-cipher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CyrillicHighlightDirective],
  templateUrl: './caesar.html',
  styleUrls: ['./caesar.scss'],
})
export class CaesarCipherComponent {
  @ViewChild('textInput') textInput!: ElementRef;
  cipherForm: FormGroup;
  result: string = '';
  foundKey: number = 0;
  error: string = '';

  constructor(private fb: FormBuilder, private cipherService: CaesarService) {
    this.cipherForm = this.fb.group({
      text: [
        '',
        [Validators.required, Validators.pattern(/^[а-яА-ЯёЁa-zA-Z\s]*$/)],
      ],
      key: [
        0,
        [Validators.required, Validators.pattern(/^-?[0-9]$|^-?[1-9][0-9]*$/)],
      ],
      operation: ['encrypt', Validators.required],
    });

    this.cipherForm.get('operation')?.valueChanges.subscribe((operation) => {
      const keyControl = this.cipherForm.get('key');
      if (operation === 'crack') {
        keyControl?.clearValidators();
      } else {
        keyControl?.setValidators([
          Validators.required,
          Validators.pattern(/^-?[0-9]$|^-?[1-9][0-9]*$/),
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
      this.foundKey = 0;

      try {
        switch (operation) {
          case 'encrypt':
            this.result = this.cipherService.encrypt(text, key);
            break;
          case 'decrypt':
            this.result = this.cipherService.decrypt(text, key);
            break;
          case 'crack':
            const crackResult = this.cipherService.crack(text);
            this.result = crackResult.decryptedText;
            this.foundKey = crackResult.shift;
            break;
        }
      } catch (err) {
        this.error = 'Произошла ошибка при обработке текста';
        this.result = '';
        this.foundKey = 0;
      }
    } else {
      this.error = 'Пожалуйста, проверьте правильность ввода';
    }
  }

  clearForm() {
    this.cipherForm.reset({ operation: 'encrypt', key: 0 });
    this.textInput.nativeElement.innerText = '';
    this.result = '';
    this.foundKey = 0;
    this.error = '';
  }
}
