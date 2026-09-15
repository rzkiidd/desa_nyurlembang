/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module '@supabase/ssr' {
  export type CookieOptions = any;
  export function createServerClient(supabaseUrl: string, supabaseAnonKey: string, options: any): any;
}

declare module 'next/server' {
  export class NextResponse {
    static next(init?: any): any;
    static redirect(url: URL | string): any;
  }
  export type NextRequest = any;
}
