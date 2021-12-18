export class HttpErrorResponse extends Error {
  status = 500;
  message: string = 'Internal Server Error';

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
