import express from 'express';

export class ServerTiming {
  private readonly timings: TimingEntry[] = [];
  private currTiming: TimingEntry | null;

  constructor() {
    this.currTiming = {name: 'init', nanos: process.hrtime.bigint()};
  }

  startNext(name: TimingEntry['name'], description?: TimingEntry['description']): void {
    this.stopCurrent();

    this.currTiming = {name, description, nanos: process.hrtime.bigint()};
  }

  stopCurrent(): void {
    if (this.currTiming) {
      const elapsedNanos = process.hrtime.bigint() - this.currTiming.nanos;

      this.timings.push({name: this.currTiming.name, description: this.currTiming.description, nanos: elapsedNanos});
      this.currTiming = null;
    }
  }

  setHttpHeader(res: express.Response): void {
    this.stopCurrent();
    res.setHeader('Server-Timing', this.toHttpHeader());
  }

  private toHttpHeader(): string {
    let result = '';

    for (const timing of this.timings) {
      if (result.length > 0) {
        result += ', ';
      }

      result += `${timing.name};${timing.description ? `desc="${timing.description.replace(/"/g, '\\"')}";` : ''}dur=${Number(timing.nanos) * 0.000001}`;
    }

    return result;
  }

  static getExpressMiddleware(timingsEnabled: boolean): (req: express.Request, res: express.Response, next: express.NextFunction) => void {
    if (timingsEnabled) {
      return (req, res, next) => {
        res.locals.timings = new ServerTiming();

        const orgSend = res.send;
        res.send = (body) => {
          res.locals.timings?.setHttpHeader(res);

          res.send = orgSend;  // #send(body) might call itself with another body
          return res.send.call(res, body);
        };

        next();
      };
    }

    return (req, res, next) => next();
  }
}

interface TimingEntry {
  name: string;
  description?: string;

  nanos: bigint;
}
