declare module "@json2csv/plainjs" {
  export interface ParserOptions {
    fields?: string[];
    [key: string]: any;
  }

  export class Parser<T = any> {
    constructor(opts?: ParserOptions);
    parse(data: T[] | T): string;
  }
}
