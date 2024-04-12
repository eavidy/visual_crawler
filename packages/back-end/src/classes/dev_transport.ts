import * as wins from "winston";

const Transport = (wins as any).Transport as any;

export class DevTransport extends Transport {
  constructor(opts: any) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    console.log(info);
    callback();
  }
}
