import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { VigenereComponent } from './components/vigenere/vigenere.component';
import { CyrillicHighlightDirective } from './directive/hilight.directive';

@NgModule({
  declarations: [AppComponent, VigenereComponent],
  imports: [BrowserModule, ReactiveFormsModule, CyrillicHighlightDirective],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
