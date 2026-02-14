/// <reference types="@clerk/express/env" />
/// <reference types="multer" />

declare namespace Express {
  export interface Request {
    file?: Multer.File;
  }
}
