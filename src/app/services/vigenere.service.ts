import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VigenereService {
  private readonly alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';
  private readonly alphabetLength = this.alphabet.length;

  constructor() {}

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^а-я]/g, '');
  }

  private formatOutput(text: string): string {
    return (
      text
        .toUpperCase()
        .match(/.{1,5}/g)
        ?.join(' ') || ''
    );
  }

  private formatKey(text: string): string {
    return text.toUpperCase();
  }

  encrypt(text: string, key: string): string {
    const normalizedText = this.normalizeText(text);
    const normalizedKey = this.normalizeText(key);
    let result = '';

    for (let i = 0; i < normalizedText.length; i++) {
      const textChar = normalizedText[i];
      const keyChar = normalizedKey[i % normalizedKey.length];

      const textIndex = this.alphabet.indexOf(textChar);
      const keyIndex = this.alphabet.indexOf(keyChar);

      const encryptedIndex = (textIndex + keyIndex) % this.alphabetLength;
      result += this.alphabet[encryptedIndex];
    }

    return this.formatOutput(result);
  }

  decrypt(text: string, key: string): string {
    const normalizedText = this.normalizeText(text);
    const normalizedKey = this.normalizeText(key);
    let result = '';

    for (let i = 0; i < normalizedText.length; i++) {
      const textChar = normalizedText[i];
      const keyChar = normalizedKey[i % normalizedKey.length];

      const textIndex = this.alphabet.indexOf(textChar);
      const keyIndex = this.alphabet.indexOf(keyChar);

      const decryptedIndex =
        (textIndex - keyIndex + this.alphabetLength) % this.alphabetLength;
      result += this.alphabet[decryptedIndex];
    }

    return this.formatOutput(result);
  }

  crack(text: string): { key: string; decryptedText: string } {
    const normalizedText = this.normalizeText(text);
    const possibleKeyLengths = this.findPossibleKeyLengths(normalizedText);
    const mostProbableKeyLength = possibleKeyLengths[0];

    let key = '';
    for (let i = 0; i < mostProbableKeyLength; i++) {
      const column = this.getColumn(normalizedText, i, mostProbableKeyLength);
      const frequencies = this.calculateFrequencies(column);
      const shift = this.findBestShift(frequencies);
      key += this.alphabet[shift];
    }

    return {
      key: this.formatKey(key),
      decryptedText: this.decrypt(text, key),
    };
  }

  private findPossibleKeyLengths(text: string): number[] {
    const distances: { [key: number]: number } = {};

    for (let i = 0; i < text.length - 2; i++) {
      for (let j = i + 1; j < text.length - 2; j++) {
        if (text.substring(i, i + 3) === text.substring(j, j + 3)) {
          const distance = j - i;
          for (let k = 2; k <= Math.min(20, distance); k++) {
            if (distance % k === 0) {
              distances[k] = (distances[k] || 0) + 1;
            }
          }
        }
      }
    }

    return Object.entries(distances)
      .sort((a, b) => b[1] - a[1])
      .map(([length]) => parseInt(length));
  }

  private getColumn(text: string, start: number, step: number): string {
    let result = '';
    for (let i = start; i < text.length; i += step) {
      result += text[i];
    }
    return result;
  }

  private calculateFrequencies(text: string): number[] {
    const frequencies = new Array(this.alphabetLength).fill(0);
    for (const char of text) {
      const index = this.alphabet.indexOf(char);
      if (index !== -1) {
        frequencies[index]++;
      }
    }
    return frequencies;
  }

  private findBestShift(frequencies: number[]): number {
    const russianFrequencies = [
      0.062, 0.014, 0.038, 0.013, 0.025, 0.072, 0.007, 0.016, 0.062, 0.01,
      0.028, 0.035, 0.026, 0.053, 0.09, 0.023, 0.04, 0.045, 0.053, 0.021, 0.002,
      0.009, 0.003, 0.012, 0.006, 0.003, 0.014, 0.016, 0.014, 0.003, 0.006,
      0.018,
    ];

    let bestShift = 0;
    let minDifference = Infinity;

    for (let shift = 0; shift < this.alphabetLength; shift++) {
      let difference = 0;
      for (let i = 0; i < this.alphabetLength; i++) {
        const shiftedIndex = (i + shift) % this.alphabetLength;
        const expected = russianFrequencies[i] * frequencies.length;
        const actual = frequencies[shiftedIndex];
        difference += Math.pow(actual - expected, 2);
      }
      if (difference < minDifference) {
        minDifference = difference;
        bestShift = shift;
      }
    }

    return bestShift;
  }
}
