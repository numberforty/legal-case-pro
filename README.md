This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Before running the application you need to set up your environment and database.

1. **Create your local environment file**

   ```bash
   cp .env.example .env.local
   ```

2. **Run Prisma migrations**

   ```bash
   npx prisma migrate dev
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Start the WhatsApp worker in another terminal**

   ```bash
   npm run whatsapp
   ```

   When the worker starts it prints a QR code in the terminal. A Chromium window
   may also open to display the QR code when running in development mode.
   Scan this code with the WhatsApp mobile app to link the session and keep the
   worker running so messages continue syncing.

   If you ever need to log in again, delete the `.wwebjs_auth` folder and restart
   the worker to generate a new QR code. Set `NODE_ENV=production` if you prefer
   the worker to run headless without opening a browser window.

Run the worker alongside `npm run dev` so the WhatsApp client stays connected.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
