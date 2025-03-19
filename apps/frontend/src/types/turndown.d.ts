declare module 'turndown' {
  export default class TurndownService {
    constructor(options?: any);
    turndown(html: string): string;
    addRule(key: string, rule: any): void;
    keep(filter: string | string[]): void;
    remove(filter: string | string[]): void;
  }
}
