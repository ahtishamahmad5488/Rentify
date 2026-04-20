I am building a Final Year Project (FYP) named:
"Rentify – AI-Based Housing & Rental Platform"

Your role is to help me COMPLETE this project efficiently using my EXISTING CODEBASE. This is very important: we are NOT building from scratch, we are MODIFYING and COMPLETING an already developed project.

========================
PROJECT OVERVIEW
========================

Rentify is a mobile application that allows users to:

- Browse rental properties
- Search and filter properties based on location and preferences
- View property details
- Chat with property owners
- Book properties
- View property locations on map
- Perform a simulated (fake) payment

The goal is to build a CLEAN, WORKING, DEMO-READY application (NOT production-level).

IMPORTANT:

- Do NOT overcomplicate anything
- Focus on working features and smooth user flow
- Prefer simple and reliable implementations over advanced/complex ones
- Impliment cool animation if possible in APP

========================
PROJECT ARCHITECTURE (IMPORTANT)
========================

This project follows a MONOREPO structure with 3 main folders:

1. client → React Native mobile application
2. admin → Admin panel frontend
3. server → Node.js + Express backend

You MUST always respect this structure when giving code or instructions.

========================
TECH STACK
========================

Frontend (Mobile - client):

- React Native CLI
- React Navigation
- Zustand + Context API (state management)
- React Hook Form + Yup
- Axios

Backend (server):

- Node.js + Express
- MongoDB (MAIN database for properties, bookings, payments)
- REST APIs

Firebase:

- Firebase Authentication (login with Google/Apple)
- Firebase Firestore (ONLY for chat system)

Libraries:

- react-native-gifted-chat (chat UI)
- react-native-maps (map integration)
- Other libraries if necessary (but keep minimal) but if you need then use it

========================
CORE FEATURES (STRICT REQUIREMENTS)
========================

1. Authentication

- Register (name, email, password)
- Login
- Firebase Authentication integration

2. Property Listing

- Add property (title, price, description, images)
- Select location using map picker (user taps on map → latitude & longitude saved)
- Store property in MongoDB (NOT Firebase)

3. Home Screen

- Display properties fetched from MongoDB (real data)
- Clean list/grid UI
- just below show the map of user location if possible to impliment this.

4. Search & Filter (IMPORTANT FEATURE)

- Search properties near user's location
- Radius-based filtering (2km, 5km, 10km)
- Filters:
  - Price range
  - Room type
  - Facilities (WiFi, AC, furniture, etc.)

5. Property Details Screen

- Show full property information
- Buttons:
  - View on Map
  - Chat
  - Book Property

6. Map Integration

- Use react-native-maps
- Show property location with marker
- Implement Map Picker for selecting location while adding property
- NO need for live user tracking

7. Chat System (DEMO PURPOSE)

- One-to-one chat using Firebase Firestore
- Use react-native-gifted-chat
- Real-time messaging
- Simple chatId (hardcoded or combined IDs)
- Must work smoothly (demo-ready)

8. Booking System

- Book property button
- Store booking in MongoDB

9. Payment System (SIMPLIFIED BUT REALISTIC UI)

- DO NOT integrate real Stripe
- Create a fake payment flow:
  - Payment screen → "Payment Successful"
  - When payment is done - this will be shown on admin panel also
- Store payment status in MongoDB
- UI should look real

1.  Profile Screen

- Show user information
- Show booking history
- about App screen their
- edit profile screen also

========================
IMPORTANT IMPLEMENTATION RULES
========================

- Use functional components with hooks
- Keep UI modern, Animated, clean, and minimal, Also add splash screens, onboarding screens that create extra level of attractiveness
- Do NOT over-engineer backend
- Use MongoDB for:
  - properties
  - bookings
  - payments
- Use Firebase ONLY for:
  - authentication
  - chat system
- Use dummy/static data ONLY if necessary for speed
- Focus on working flow instead of perfection

========================
WHAT I EXPECT FROM YOU
========================

You must:

1. Analyze existing code assumptions and guide modifications (NOT full rebuild)
2. Provide modular and clean code updates
3. Help implement missing features step-by-step
4. Ensure integration between:
   - client ↔ server ↔ MongoDB ↔ Firebase
5. Help fix bugs and improve flow
6. Keep everything optimized for FAST completion (1 day target)

========================
HOW YOU SHOULD RESPOND
========================

- Do NOT give everything at once
- Work step-by-step
- First ask or confirm what part of code is already completed
- Then guide modifications accordingly
- Provide only relevant code (not full unnecessary files)
- Explain briefly but clearly
- Always optimize for speed and simplicity

========================
CURRENT OBJECTIVE
========================

We already have a partially completed project.
We now want to:

- Fix remaining screens
- Complete chat, map, booking, and payment flow
- Ensure search & filter works
- Make the app fully demo-ready

========================
START NOW
========================
