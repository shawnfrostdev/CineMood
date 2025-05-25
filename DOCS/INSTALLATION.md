## 1. Prerequisites

- **Node.js** v20+ & **npm** (or Yarn) installed
- A GitHub account (for Vercel)
- Accounts on Neon or Railway and TMDB

---

## 2. Scaffold with the App Router & TypeScript

```bash
npx create-next-app@latest cinemood \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir
cd cinemood
git init
```

---

## 3. Tailwind CSS

Tailwind CSS is already installed with create-next-app. Verify the configuration:

**tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

**src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 4. Core Dependencies

```bash
npm install framer-motion lucide-react swr zustand zod
```

Use within components:

```tsx
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { create } from "zustand";
import { z } from "zod";
```

---

## 5. Prisma & Database Setup

```bash
npm install -D prisma
npx prisma init
npm install @prisma/client @auth/prisma-adapter
```

**.env**

```env
DATABASE_URL="postgresql://<user>:<pass>@<host>/<db>?schema=public"
```

**prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Regenerate client:

```bash
npx prisma generate
```

---

## 6. NextAuth v5 Setup

```bash
npm install next-auth@beta
```

**src/app/api/auth/[...nextauth]/route.ts**

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**.env**

```env
GITHUB_ID=…
GITHUB_SECRET=…
NEXTAUTH_URL=http://localhost:3000
```

Use in components:

```tsx
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>;
  }
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

---

## 7. TMDB API Integration

1. Get your key at [https://www.themoviedb.org](https://www.themoviedb.org)
2. Add to **.env**:

   ```env
   TMDB_API_KEY=your_tmdb_api_key
   ```

3. Fetch in an API route or server component:

   ```ts
   const res = await fetch(
     `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}`
   );
   const data = await res.json();
   ```

---

## 8. Deploy & Host

1. **GitHub**: push your `cinemood` repo
2. **Vercel**: import — it auto-detects Next.js
3. In Vercel's Dashboard → Settings → Environment Variables, copy:

   - `DATABASE_URL`
   - `GITHUB_ID`, `GITHUB_SECRET`
   - `TMDB_API_KEY`

4. **Neon** or **Railway**: create a free PostgreSQL database → copy its URL to `DATABASE_URL`

---
