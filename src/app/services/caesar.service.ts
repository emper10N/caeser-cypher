import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CaesarService {
  private readonly russianAlphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';
  private readonly englishAlphabet = 'abcdefghijklmnopqrstuvwxyz';
  private readonly russianAlphabetSize = this.russianAlphabet.length;
  private readonly englishAlphabetSize = this.englishAlphabet.length;
  private readonly russianFrequencies = [
    0.062, 0.014, 0.038, 0.013, 0.025, 0.072, 0.007, 0.016, 0.062, 0.01, 0.028,
    0.035, 0.026, 0.053, 0.09, 0.023, 0.04, 0.045, 0.053, 0.021, 0.002, 0.009,
    0.003, 0.012, 0.006, 0.003, 0.014, 0.016, 0.014, 0.003, 0.006, 0.018,
  ];

  constructor() {}

  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '');
  }

  private formatOutput(text: string): string {
    const upperText = text.toUpperCase();
    const groups = [];
    for (let i = 0; i < upperText.length; i += 5) {
      groups.push(upperText.slice(i, i + 5));
    }
    return groups.join(' ');
  }

  encrypt(text: string, key: number): string {
    return this.transform(text, key);
  }

  decrypt(text: string, key: number): string {
    return this.transform(text, -key);
  }

  private transform(text: string, key: number): string {
    const normalizedText = this.normalizeText(text);
    let result = '';

    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];

      const russianIndex = this.russianAlphabet.indexOf(char);
      if (russianIndex !== -1) {
        const russianKey =
          ((key % this.russianAlphabetSize) + this.russianAlphabetSize) %
          this.russianAlphabetSize;
        const newIndex = (russianIndex + russianKey) % this.russianAlphabetSize;
        result += this.russianAlphabet[newIndex];
        continue;
      }

      const englishIndex = this.englishAlphabet.indexOf(char);
      if (englishIndex !== -1) {
        const englishKey =
          ((key % this.englishAlphabetSize) + this.englishAlphabetSize) %
          this.englishAlphabetSize;
        const newIndex = (englishIndex + englishKey) % this.englishAlphabetSize;
        result += this.englishAlphabet[newIndex];
        continue;
      }

      result += char;
    }

    return this.formatOutput(result);
  }

  crack(text: string): { decryptedText: string; shift: number } {
    const normalizedText = this.normalizeText(text);
    const frequencies = this.calculateFrequencies(normalizedText);
    const expectedFrequencies = this.russianFrequencies;

    let bestShift = 0;
    let minDifference = Infinity;

    for (let shift = 0; shift < this.russianAlphabetSize; shift++) {
      const difference = this.calculateLeastSquaresDifference(
        frequencies,
        expectedFrequencies,
        shift
      );

      if (difference < minDifference) {
        minDifference = difference;
        bestShift = shift;
      }
    }

    return {
      decryptedText: this.decrypt(text, bestShift),
      shift: bestShift,
    };
  }

  private calculateFrequencies(text: string): number[] {
    const frequencies = new Array(this.russianAlphabetSize).fill(0);
    let totalLetters = 0;

    for (const char of text) {
      const index = this.russianAlphabet.indexOf(char);
      if (index !== -1) {
        frequencies[index]++;
        totalLetters++;
      }
    }

    return frequencies.map((freq) =>
      totalLetters > 0 ? freq / totalLetters : 0
    );
  }

  private calculateLeastSquaresDifference(
    actual: number[],
    expected: number[],
    shift: number
  ): number {
    let sum = 0;
    const n = this.russianAlphabetSize;

    for (let i = 0; i < n; i++) {
      const shiftedIndex = (i + shift) % n;
      const diff = actual[shiftedIndex] - expected[i];
      sum += diff * diff;
    }

    return sum / n;
  }
}
