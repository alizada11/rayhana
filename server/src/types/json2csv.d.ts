import { Parser } from "json2csv";

declare module "json2csv" {
  export interface ParserOptions {
    fields?: string[];
    [key: string]: any;
  }
  export class Parser<T = any> {
    constructor(opts?: ParserOptions);
    parse(data: T[] | T): string;
  }
}
