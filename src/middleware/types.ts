export interface Middleware {
  (req: Request, next: () => Promise<Response>): Promise<Response>;
}
