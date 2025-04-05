// This file is needed to support autocomplete for process.env
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // gemini api key
      GEMINI_API_KEY: string;

      // google api key (alias for GEMINI_API_KEY for compatibility)
      GOOGLE_API_KEY?: string;

      // replicate api token
      REPLICATE_API_TOKEN: string;

      // stability api key
      STABILITY_API_KEY: string;

      // aiven database url
      DATABASE_URL: string;

      // stripe api/webhook secret key
      STRIPE_API_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;

      // app base url
      NEXT_PUBLIC_APP_URL: string;

      // crisp website id
      NEXT_PUBLIC_CRISP_WEBSITE_ID: string;

      // tempo environment variable
      NEXT_PUBLIC_TEMPO?: string;
    }
  }
}
