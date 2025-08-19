# Wyzly Developer Challenge
## Mini-MVP Build

Thank you for your interest in joining Wyzly!
This challenge is designed to test your ability to build a functional MVP for both frontend and backend - There is no need for a fancy design work to be done! 

We value speed, pragmatic decision-making, and the ability to deliver a working product that can be tested and iterated quickly.

---

## Requirements

### 1. Roles
- **Restaurant**: Create, update, delete a "Wyzly Box" (title, price, quantity, image).
- **Customer**: View boxes, purchase (mock payment), view order history.
- **Admin**: View all orders, mark them as complete.

### 2. Authentication
- Role-based login (email/password or magic link).

### 3. Core Business Logic
- **Inventory control**: Box marked "sold out" when quantity reaches zero.
- **Order process**: Reduce stock on purchase, log order to DB.

### 4. UI Implementation
- Design the UI yourself for all screens - keep it clean, consistent, and mobile-friendly.
- Mobile-friendly/responsive.

### 5. Deployment
- Host on **Vercel** (or similar).
- Database on **Supabase**, **MongoDB Atlas**, or **PostgreSQL**. or other at your will

---


## Mobile Thinking & App Planning Task

**Important:** In the Requirements section, "Mobile-friendly/responsive" means your **actual build** must be usable and visually correct on phones and tablets.

This Mobile Thinking & App Planning section is **not asking you to build a separate mobile app** - it is about understanding how you think about mobile user experience now, and how you would plan for a future native mobile app.

We want to see your ability to:
- Explain the reasoning behind your mobile-friendly design choices for the web build.
- Think ahead about how to efficiently transition from a web MVP to a mobile app without duplicating work.

### Part A - Mobile Web Design Rationale
After building your responsive web version, explain your mobile design decisions in either:
- A short Loom video walkthrough **OR**
- A short written explanation in your README file

In your explanation, please cover:
1. Which elements of the site you prioritized for mobile view and **why**.
2. How you adapted the layout to make it easy for a customer to reserve food on their phone.
3. Any trade-offs you made for speed, simplicity, or technical constraints.

### Part B - Future Mobile App Plan
In your README file, also answer these:
1. If we wanted to turn this web MVP into a native mobile app for iOS and Android, what approach/framework would you use and why? (e.g., React Native, Flutter)
2. How would you reuse parts of your web code to avoid duplicating work?
3. Are there any features or UX changes you would make for a mobile app that you didn't include in the web version?

We want to see how you think about **mobile-first design** and **future mobile app builds**.

**Part A - Mobile UI/UX Simulation**
- Provide a short Loom video or written walkthrough explaining:
  1. How your design choices make the site easy to use on mobile phones.
  2. Which elements you prioritized for mobile view (and why).
  3. Any trade-offs you made for speed vs. perfect responsiveness.

**Part B - Mobile App Planning**
- In your README, briefly explain:
  1. How you would transition this MVP into a cross-platform mobile app (iOS + Android).
  2. Which framework you would use (**React Native**, **Flutter**, or other) and why.
  3. How you would share code between the web and app to avoid duplication.

---

## Bonus Points - Detailed

### 1. Image Optimization
**What it means:** Efficiently load and display images so the site stays fast, even on mobile and slow connections.
- Use modern formats (**WebP/AVIF**)
- Implement responsive sizes (`srcset` or `next/image`)
- Compress without visible quality loss
- Lazy-load images outside viewport

**Why it matters for Wyzly:**
- Customers browse multiple food photos on phones - fast load improves conversion.
- Restaurants upload large images - optimization keeps site fast without manual edits.

### 2. Admin Filtering/Search
**What it means:** Allow admins to quickly find and manage orders, restaurants, menu items, and customers.
- Search by keyword
- Filter by status (e.g., pending, sold out)
- Sort by date/name
- Pagination or infinite scroll

**Why it matters for Wyzly:**
- Efficiency in daily operations, especially during peak ordering times.

### 3. Real-Time Stock Updates
**What it means:** Keep availability accurate **without page refresh**.
- Example: If a box sells out, all customers immediately see it removed or disabled.
- Achieved with **WebSockets**, **Supabase real-time**, **Firebase**, or **Next.js server actions**.

**Why it matters for Wyzly:**
- Prevents overselling.
- Builds trust with customers.
- Ensures fairness across the marketplace.

---

## Timebox
- Total time: **1-2 days** (max 10-12 hours of work).
- You may use boilerplates/templates but must customize them to match the Figma design and implement core business logic.

---

## Evaluation Criteria
1. **Completeness** - Meets all required functionality.
2. **Code Structure** - Clean, maintainable, easy for another developer to take over.
3. **Backend/API Design** - Efficient, scalable fundamentals.
4. **UI/UX** - Responsive, and works well on mobile. - No need for fancy design!
5. **Deployment** - Fully functional live demo.
6. **Speed** - Delivered within timebox.
7. **Mobile Thinking** - Clear rationale for mobile UI choices and app planning.

---

## Submission Instructions
Please submit:
- Live deployed link
- GitHub repository link
- Brief README explaining:
  - How to run locally
  - Notes for the next developer
  - Mobile-friendly design decisions (Part A)
  - Mobile app build plan (Part B)
