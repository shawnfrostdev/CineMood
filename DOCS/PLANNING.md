## **Web App Overview: Movie & TV Show Recommender**

### **Purpose**

A personalized movie and TV show recommender that helps users discover content based on their preferences and history. It supports manual selection, list management, profile customization, and social sharing.

---

### **Overall Layout**

- **Sidebar (Left side)**:

  - Recommend
  - Selection
  - My List _(renameable)_
  - Profile

- **Main Content Area (Right side)**:

  - Each tab includes a toggle:
    **`Movies | TV Shows`**

    - Only one is active at a time
    - On click, the content switches accordingly

---

### **Tabs & Their Functionality**

#### **1. Recommend Tab**

- **Top Toggle**:
  `Movies | TV Shows` — user selects which category to view

- **Function**:
  Display content recommendations based on:

  - Genre
  - Lead actors
  - Themes
  - Past selections
  - TMDB API integration

- **Content Displayed**:

  - Cards with poster, title, year, brief info
  - Buttons: "Add to List" / "Skip"
  - Loading states and error handling
  - Responsive grid layout

---

#### **2. Selection Tab**

- **Top Toggle**:
  `Movies | TV Shows`

- **Function**:
  Users manually mark what they've watched or liked.

- **Interaction**:

  - Clicking a title adds it to their list
  - That item is replaced by a new suggestion immediately
  - This helps improve future recommendations
  - Real-time updates using SWR

- **Filtering Options**:

  - Genre
  - Search bar with TMDB API integration
  - Advanced filters (year, rating, etc.)

---

#### **3. My List Tab** _(or "Library," "Watchlog," etc.)_

- **Top Toggle**:
  `Movies | TV Shows`

- **Function**:

  - View all selected titles
  - Delete entries to clean up the list
  - Persistent storage with Prisma
  - Real-time updates

- **Features**:

  - Sort: A–Z, genre, recently added
  - Notes per item (optional)
  - Batch operations
  - Export functionality

---

#### **4. Profile Tab**

- **Features**:

  - Edit name, username, profile picture
  - Theme settings: dark/light mode (Zustand state)
  - Share your list via a link
  - Account management
  - Authentication status

- **Share Behavior**:

  - When another user opens the shared link:
    - Their current list is compared with the shared one
    - Titles not already in their list are added as new recommendations
  - Privacy controls
  - Share statistics

---

### **Technical Features**

- **Authentication**:

  - NextAuth v5 integration
  - GitHub OAuth provider
  - Protected routes
  - Session management

- **Data Management**:

  - PostgreSQL database with Prisma ORM
  - TMDB API integration
  - SWR for data fetching
  - Zustand for state management

- **UI/UX**:

  - Tailwind CSS for styling
  - Framer Motion for animations
  - Lucide icons
  - Responsive design
  - Dark/Light mode

- **Performance**:
  - Server-side rendering with Next.js 14
  - API route caching
  - Optimized images
  - Lazy loading

---

### **Project Structure**

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── recommend/
│   │   ├── selection/
│   │   ├── my-list/
│   │   └── profile/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── auth/
│   └── dashboard/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── tmdb.ts
└── types/
    └── index.ts
```

---

### **Future Enhancements**

- Social features (comments, ratings)
- Advanced recommendation algorithms
- Multiple authentication providers
- Mobile app version
- Offline support
- Analytics dashboard

---
