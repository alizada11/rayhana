/// <reference types="multer" />

declare namespace Express {
  export interface Request {
    file?: Multer.File;
    auth?: {
      userId?: string;
      sessionId?: string;
    };
    user?: import("../src/db/schema").User;
  }
}
