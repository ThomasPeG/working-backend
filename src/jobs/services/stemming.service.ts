import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class StemmingService {
  private stemmer: any;

  constructor() {
    // Inicializar el stemmer para español
    // this.stemmer = natural.SnowballStemmer.stemmer('spanish');
    this.stemmer = natural.PorterStemmerEs;
  }

  /**
   * Obtiene el stem de una palabra en español
   */
  stemWord(word: string): string {
    return this.stemmer.stem(word.toLowerCase());
  }

  /**
   * Obtiene el stem de una frase completa
   */
  stemPhrase(phrase: string): string {
    const tokenizer = new natural.AggressiveTokenizer();
    const tokens = tokenizer.tokenize(phrase.toLowerCase());
    
    return tokens.map(token => this.stemmer.stem(token)).join(' ');
  }

  /**
   * Calcula la similitud entre dos frases usando stemming
   * Retorna un valor entre 0 y 1, donde 1 es coincidencia perfecta
   */
  calculateSimilarity(phrase1: string, phrase2: string): number {
    const stemmed1 = this.stemPhrase(phrase1);
    const stemmed2 = this.stemPhrase(phrase2);
    
    // Usar JaroWinkler para calcular similitud
    return natural.JaroWinklerDistance(stemmed1, stemmed2);
  }
}