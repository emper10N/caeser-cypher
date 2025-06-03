import { trigger } from '@angular/animations';
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appCyrillicHighlight]',
  standalone: true,
})
export class CyrillicHighlightDirective {
  private lastCursorPosition: number = 0;
  private isComposing: boolean = false;

  constructor(private el: ElementRef) {}
  private _regex: RegExp = /^[а-яА-ЯёЁ\s]$/;

  @Input('appCyrillicHighlight')
  set regexPattern(pattern: string | RegExp) {
    if (typeof pattern === 'string') {
      const patternBody = pattern.replace(/^\/|\/$/g, '');
      this._regex = new RegExp(patternBody);
    } else {
      this._regex = pattern;
    }
  }

  @HostListener('compositionstart')
  onCompositionStart() {
    this.isComposing = true;
  }

  @HostListener('compositionend')
  onCompositionEnd() {
    this.isComposing = false;
    this.highlightText();
  }

  @HostListener('input')
  onInput() {
    if (!this.isComposing) {
      this.highlightText();
    }
  }

  private highlightText() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(this.el.nativeElement);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      this.lastCursorPosition = preCaretRange.toString().length;
    }

    const text = this.el.nativeElement.innerText;

    this.el.nativeElement.innerHTML = '';

    const lines = text.split('\n');

    lines.forEach((line: string, index: number) => {
      const textNode = document.createTextNode(line);

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;

      for (let i = 0; i < line.length; i++) {
        if (!this._regex.test(line[i])) {
          if (i > lastIndex) {
            fragment.appendChild(
              document.createTextNode(line.slice(lastIndex, i))
            );
          }

          const span = document.createElement('span');
          span.className = 'non-cyrillic';
          span.textContent = line[i];
          fragment.appendChild(span);

          lastIndex = i + 1;
        }
      }

      if (lastIndex < line.length) {
        fragment.appendChild(document.createTextNode(line.slice(lastIndex)));
      }

      this.el.nativeElement.appendChild(fragment);

      if (index < lines.length - 1) {
        this.el.nativeElement.appendChild(document.createElement('br'));
      }
    });

    if (selection) {
      const range = document.createRange();
      const walker = document.createTreeWalker(
        this.el.nativeElement,
        NodeFilter.SHOW_TEXT,
        null
      );

      let currentPosition = 0;
      let targetNode = this.el.nativeElement.firstChild as Text;
      let targetOffset = 0;

      let node: Text | null;
      while ((node = walker.nextNode() as Text)) {
        const nodeLength = node.length;
        if (currentPosition + nodeLength >= this.lastCursorPosition) {
          targetNode = node;
          targetOffset = this.lastCursorPosition - currentPosition;
          break;
        }
        currentPosition += nodeLength;
      }

      range.setStart(targetNode, targetOffset);
      range.setEnd(targetNode, targetOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);
        range.setStartAfter(br);
        range.setEndAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
}
