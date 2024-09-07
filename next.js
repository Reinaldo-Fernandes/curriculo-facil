import { SpeedInsights } from "@vercel/speed-insights/next"
 
export default function RootLayout({ children }) {
    return (
      <html lang="pt-br">
        <head>
          <title>Next.js</title>
        </head>
        <body>
          {children}
          <SpeedInsights />
        </body>
      </html>
    );
  }