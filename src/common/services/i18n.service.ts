import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class I18nService {
  private translations: { [lang: string]: any } = {};
  private zodMappings: { [errorCode: string]: string } = {};

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const langs = ['en', 'vi'];
    langs.forEach((lang) => {
      const filePath = path.join(process.cwd(), 'i18n', `${lang}.json`);
      console.log(`Loading translation file: ${filePath}`);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          this.translations[lang] = data;
          this.zodMappings = { ...this.zodMappings, ...data.zod_mapping || {} };
          console.log(`Loaded translations for ${lang}:`, JSON.stringify(data, null, 2));
          console.log(`Zod mappings:`, this.zodMappings);
        } catch (error) {
          console.error(`Failed to load translation file ${filePath}:`, error);
        }
      } else {
        console.error(`Translation file not found: ${filePath}`);
      }
    });
  }

  translate(key: string, params: { [key: string]: any } = {}, lang: string = 'vi'): string {
    console.log(`Translating key: ${key}, lang: ${lang}, params:`, params);
    const keys = key.split('.');
    let message = this.translations[lang] || this.translations['en'] || {};

    for (const k of keys) {
      if (message && message[k] !== undefined) {
        message = message[k];
      } else {
        console.warn(`Translation not found for key: ${key}, lang: ${lang}`);
        return key;
      }
    }

    if (typeof message === 'string' && params) {
      return this.replaceParams(message, params);
    }
    return message || key;
  }

  mapZodErrorToKey(errorCode: string): string {
    const mappedKey = this.zodMappings[errorCode] || 'validation.unknown';
    console.log(`Mapping Zod error code: ${errorCode} -> ${mappedKey}`);
    return mappedKey;
  }

  private replaceParams(message: string, params: { [key: string]: any }): string {
    let result = message;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }
}