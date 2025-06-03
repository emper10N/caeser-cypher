import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CaesarService {
  private readonly russianAlphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
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
    return text.toLowerCase();
  }

  private formatOutput(text: string): string {
    return text.toUpperCase();
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
    const frequencies = this.calculateFrequencies(text);
    const expectedFrequencies = this.getExpectedFrequencies();
    let bestShift = 0;
    let minDifference = Infinity;

    for (let shift = 0; shift < this.russianAlphabetSize; shift++) {
      const difference = this.calculateDifference(
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

    text
      .toLowerCase()
      .split('')
      .forEach((char) => {
        const index = this.russianAlphabet.indexOf(char);
        if (index !== -1) {
          frequencies[index]++;
          totalLetters++;
        }
      });

    return frequencies.map((freq) =>
      totalLetters > 0 ? freq / totalLetters : 0
    );
  }

  private getExpectedFrequencies(): number[] {
    return this.russianFrequencies;
  }

  private calculateDifference(
    actual: number[],
    expected: number[],
    shift: number
  ): number {
    let sum = 0;
    for (let i = 0; i < this.russianAlphabetSize; i++) {
      const shiftedIndex = (i + shift) % this.russianAlphabetSize;
      const diff = actual[shiftedIndex] - expected[i];
      sum += diff * diff;
    }
    return sum;
  }
}
