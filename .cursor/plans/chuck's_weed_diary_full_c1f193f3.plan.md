---
name: Chuck's Weed Diary Full
overview: Complete MERN stack build for Chuck's Weed Diary with every field fully specified, package requirements, performance setup instructions, and automated API tests that must pass before the plan is considered done.
todos:
  - id: scaffold
    content: "Scaffold full project structure: root, client (Vite+React), server (Express), all dirs and package.json files"
    status: pending
  - id: setup-docs
    content: Write setup.md with Atlas, Cloudinary, Google Maps free-tier guides; create .env.example
    status: pending
  - id: install-deps
    content: npm install all packages listed in Section 6 for root, server, and client
    status: pending
  - id: db-config
    content: Create server/config/db.js (Mongoose connect) and server/config/cloudinary.js
    status: pending
  - id: models
    content: Create Entry.js and CustomOption.js Mongoose schemas per Section 2 spec (all 58 fields)
    status: pending
    dependencies:
      - db-config
  - id: auth-backend
    content: Create authCheck middleware and POST /api/auth/login route
    status: pending
    dependencies:
      - models
  - id: test-setup
    content: Create server/tests/setup.js with mongodb-memory-server lifecycle
    status: pending
    dependencies:
      - models
  - id: auth-tests
    content: Write and pass server/tests/auth.test.js (3 tests)
    status: pending
    dependencies:
      - auth-backend
      - test-setup
  - id: crud-routes
    content: "Build entries CRUD routes: create, read, update, delete, list (condensed), search"
    status: pending
    dependencies:
      - auth-backend
  - id: entries-tests
    content: Write and pass server/tests/entries.test.js (23 tests including all validations)
    status: pending
    dependencies:
      - crud-routes
      - test-setup
  - id: options-routes
    content: "Build custom options routes: GET/POST /api/options with defaults merge"
    status: pending
    dependencies:
      - models
  - id: options-tests
    content: Write and pass server/tests/options.test.js (7 tests)
    status: pending
    dependencies:
      - options-routes
      - test-setup
  - id: upload-route
    content: Build Cloudinary upload route with multer
    status: pending
    dependencies:
      - db-config
  - id: analytics-route
    content: Build GET /api/analytics with MongoDB aggregation pipelines
    status: pending
    dependencies:
      - crud-routes
  - id: analytics-tests
    content: Write and pass server/tests/analytics.test.js (3 tests)
    status: pending
    dependencies:
      - analytics-route
      - test-setup
  - id: server-entry
    content: "Wire up server/index.js: Express app with all middleware, routes, static serving, compression"
    status: pending
    dependencies:
      - crud-routes
      - options-routes
      - upload-route
      - analytics-route
  - id: vite-setup
    content: "Set up client: vite.config.js with proxy, main.jsx, App.jsx with lazy routes"
    status: pending
    dependencies:
      - install-deps
  - id: theme-css
    content: "Create CSS theme: variables.css, global.css with reggae color palette, fonts, mobile-first base"
    status: pending
    dependencies:
      - vite-setup
  - id: auth-frontend
    content: Build AuthContext, LoginPage, ProtectedRoute, api.js fetch wrapper
    status: pending
    dependencies:
      - vite-setup
  - id: entry-form
    content: Build EntryFormPage with all 58 fields in collapsible sections, all sub-components (SensoryPicker, EffectsRater, StrainList, TagInput, ImageUploader)
    status: pending
    dependencies:
      - auth-frontend
      - theme-css
  - id: home-page
    content: "Build HomePage: EntryCard grid, SearchBar, SkeletonCard, pagination, add/edit/view buttons"
    status: pending
    dependencies:
      - auth-frontend
      - theme-css
  - id: entry-view
    content: "Build EntryViewPage: read-only display, MapEmbed, image gallery, edit button"
    status: pending
    dependencies:
      - theme-css
  - id: analytics-page
    content: "Build AnalyticsPage: 8 Chart.js charts per Section 7 spec"
    status: pending
    dependencies:
      - theme-css
  - id: performance
    content: Add code splitting, compression, Cloudinary transforms, skeleton screens, cache headers, lazy loading
    status: pending
    dependencies:
      - home-page
      - entry-view
  - id: run-all-tests
    content: Run full test suite (36+ tests), fix any failures -- plan is NOT complete until all pass
    status: pending
    dependencies:
      - auth-tests
      - entries-tests
      - options-tests
      - analytics-tests
isProject: false
---

# Chuck's Weed Diary -- Comprehensive Build Plan

---

## 1. Complete Field Specification

Every field from the original request, with data type, validation, UI behavior, and special notes.

### 1.1 Meta Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 1 | `createdAt` | Date | `Date.now()` auto-set on create | Required, immutable after create | Display-only, auto-filled, not editable |

| 2 | `updatedAt` | Date | `Date.now()` auto-set on create/update | Auto-managed by Mongoose `timestamps: true` | Display-only |

### 1.2 Product Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 3 | `productName` | String | `""` | Required, trimmed | Text input |

| 4 | `strains` | Array of objects | `[]` | Each element: `{ name: String (required), type: enum }` | List input -- user adds multiple strains. Each strain has a name (text input) and a type (single-select dropdown: `"sativa"`, `"indica"`, `"hybrid"`). "Add another strain" button appends a new row. |

| 5 | `brand` | String | `""` | Optional, trimmed | Text input |

**Special note on strains**: This is NOT a single select. A product can have multiple strains (e.g., a blend). The UI must allow adding/removing strain entries dynamically.

### 1.3 Purchase Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 6 | `quantity` | Number | `null` | Optional, min 0, unit is grams | Number input with "g" suffix label |

| 7 | `price` | Number | `null` | Optional, min 0 | Number input with "$" prefix label |

| 8 | `priceNotes` | String | `""` | Optional | Textarea, placeholder: "e.g., price includes tips and taxes" |

### 1.4 Dispensary Fields (nested object)

| # | Field | Path | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|---|

| 9 | Dispensary Name | `dispensary.name` | String | `""` | Optional | Text input |

| 10 | Dispensary Location | `dispensary.location` | String | `""` | Optional | Text input (address/city). In **read-only view**, renders a Google Maps Embed iframe: `https://www.google.com/maps/embed/v1/place?key=KEY&q=ENCODED_LOCATION`. Falls back to a plain Google Maps link if no API key. |

| 11 | Dispensary Website | `dispensary.website` | String | `""` | Optional, must be valid URL if provided | Text input. In read-only view, renders as clickable link opening in new tab. |

### 1.5 Cannabis Form Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 12 | `cannabisForm` | String (enum) | `""` | Optional, one of: `"flower"`, `"oil"`, `"edible"`, `"extract"`, `"tincture"`, `"topical"`, `"other"` | **Single-select** radio group or dropdown. Max one selection. |

| 13 | `customCannabisForm` | String | `""` | Required only if `cannabisForm === "other"` | Text input that **only appears** when "other" is selected. Hidden otherwise. |

| 14 | `cannabisFormNotes` | String | `""` | Optional | Textarea |

### 1.6 Consumption Method Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 15 | `consumptionMethod` | String (enum) | `""` | Optional, one of: `"smoke"`, `"vape"`, `"ingest"`, `"dab"`, `"sublingual"`, `"apply"`, `"other"` | **Single-select** radio group or dropdown. Max one selection. |

| 16 | `customConsumptionMethod` | String | `""` | Required only if `consumptionMethod === "other"` | Text input, **only visible** when "other" is selected. |

| 17 | `consumptionMethodNotes` | String | `""` | Optional | Textarea |

### 1.7 Aroma Fields

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 18 | `aromas` | Array of `{ name: String, strength: Number }` | `[]` | Each: name required, strength integer 1-10 | **Multi-select with no cap**. Default options: `Nutty, Sweet, Fruity, Citrusy, Floral, Herbal, Woody, Musky, Pungent, Spicy`. When an option is toggled ON, a **slider (1-10)** appears next to it for strength rating. |

| 19 | `aromaNotes` | String | `""` | Optional | Textarea |

**Special behavior -- custom aromas**: User can click "Add Custom Aroma" which shows a text input. Once submitted, that custom name is **persisted to a `CustomOptions` collection** (`{ type: "aroma", name: "..." }`). On **all future entries**, that custom aroma appears alongside the default options in the selection list.

### 1.8 Flavor Fields (identical structure to Aroma)

| # | Field | Type | Default | Validation | UI Behavior |

|---|---|---|---|---|---|

| 20 | `flavors` | Array of `{ name: String, strength: Number }` | `[]` | Same rules as aromas | Same UI as aromas, just labeled "Flavor". Default options: `Nutty, Sweet, Fruity, Citrusy, Floral, Herbal, Woody, Musky, Pungent, Spicy`. |

| 21 | `flavorNotes` | String | `""` | Optional | Textarea |

**Special behavior -- custom flavors**: Identical to custom aromas. Persisted as `{ type: "flavor", name: "..." }` in `CustomOptions`. Shows in future entries.

### 1.9 Cannabinoid Ratios (nested object, all % floats)

| # | Field | Path | Type | Default | Validation |

|---|---|---|---|---|---|

| 22 | THC | `cannabinoids.thc` | Number | `null` | Optional, 0-100 |

| 23 | CBD | `cannabinoids.cbd` | Number | `null` | Optional, 0-100 |

| 24 | THCA | `cannabinoids.thca` | Number | `null` | Optional, 0-100 |

| 25 | THCV | `cannabinoids.thcv` | Number | `null` | Optional, 0-100 |

| 26 | CBDA | `cannabinoids.cbda` | Number | `null` | Optional, 0-100 |

| 27 | CBDV | `cannabinoids.cbdv` | Number | `null` | Optional, 0-100 |

| 28 | CBG | `cannabinoids.cbg` | Number | `null` | Optional, 0-100 |

| 29 | CBN | `cannabinoids.cbn` | Number | `null` | Optional, 0-100 |

| 30 | CBC | `cannabinoids.cbc` | Number | `null` | Optional, 0-100 |

UI: grid of labeled number inputs with "%" suffix. All optional.

### 1.10 Terpene Profile (nested object)

| # | Field | Path | Type | Default | Validation | UI |

|---|---|---|---|---|---|---|

| 31 | Dominant Terpenes | `terpenes.dominant` | Array of String | `[]` | Optional | Multi-value text input (tag-style, user types and hits enter to add) |

| 32 | Secondary Terpenes | `terpenes.secondary` | Array of String | `[]` | Optional | Same tag-style input |

### 1.11 Dosage Details (nested object)

| # | Field | Path | Type | Default | Validation | UI |

|---|---|---|---|---|---|---|

| 33 | Amount Consumed | `dosage.amountConsumed` | String | `""` | Optional | Text input (freeform, e.g. "0.5g", "1 gummy") |

| 34 | Times Taken | `dosage.timesTaken` | Number | `null` | Optional, integer, min 1 | Number input |

| 35 | Time to Effect | `dosage.timeToEffect` | String | `""` | Optional | Text input (e.g. "15 minutes") |

| 36 | Length of Effects | `dosage.lengthOfEffects` | String | `""` | Optional | Text input (e.g. "3 hours") |

### 1.12 Entourage Effects (nested object, all Number 0-10, default 0)

| # | Field | Path | Type | Default | Validation |

|---|---|---|---|---|---|

| 37 | Pain Relief | `effects.painRelief` | Number | `0` | 0-10, integer |

| 38 | Headache | `effects.headache` | Number | `0` | 0-10 |

| 39 | Energy | `effects.energy` | Number | `0` | 0-10 |

| 40 | Creative | `effects.creative` | Number | `0` | 0-10 |

| 41 | Stress Relief | `effects.stressRelief` | Number | `0` | 0-10 |

| 42 | Dry Mouth | `effects.dryMouth` | Number | `0` | 0-10 |

| 43 | Sleepy | `effects.sleepy` | Number | `0` | 0-10 |

| 44 | Anxious | `effects.anxious` | Number | `0` | 0-10 |

| 45 | Cramp Relief | `effects.crampRelief` | Number | `0` | 0-10 |

| 46 | Dry Eyes | `effects.dryEyes` | Number | `0` | 0-10 |

| 47 | Lazy | `effects.lazy` | Number | `0` | 0-10 |

| 48 | Focused | `effects.focused` | Number | `0` | 0-10 |

| 49 | Relaxation | `effects.relaxation` | Number | `0` | 0-10 |

| 50 | Hungry | `effects.hungry` | Number | `0` | 0-10 |

| 51 | Uplifted | `effects.uplifted` | Number | `0` | 0-10 |

| 52 | Peaceful | `effects.peaceful` | Number | `0` | 0-10 |

UI: Grid of labeled sliders, all defaulting to 0.

### 1.13 Effect Notes

| # | Field | Type | Default | Validation | UI |

|---|---|---|---|---|---|

| 53 | `symptomsRelievedNotes` | String | `""` | Optional | Textarea |

| 54 | `otherEffectsNotes` | String | `""` | Optional | Textarea |

### 1.14 Ratings

| # | Field | Type | Default | Validation | UI |

|---|---|---|---|---|---|

| 55 | `medicalRating` | Number | `null` | Optional, 0.0 to 10.0, step 0.1 | Number input or slider with 0.1 step |

| 56 | `recreationalRating` | Number | `null` | Optional, 0.0 to 10.0, step 0.1 | Same |

### 1.15 Images

| # | Field | Type | Default | Validation | UI |

|---|---|---|---|---|---|

| 57 | `flowerImageUrl` | String | `""` | Optional, valid URL | Single image upload. Uploaded to Cloudinary, URL stored. Preview shown. |

| 58 | `coaImageUrls` | Array of String | `[]` | Optional, each valid URL | **Multiple** image upload. COA = Certificate of Analysis. Each uploaded to Cloudinary. Gallery display in view. |

---

**Total: 58 distinct data points across 15 groups.**

---

## 2. Mongoose Schemas

### Entry Schema

```javascript
const entrySchema = new mongoose.Schema({
  // 1.2 Product
  productName: { type: String, required: true, trim: true },
  strains: [{
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['sativa', 'indica', 'hybrid'], required: true }
  }],
  brand: { type: String, trim: true, default: '' },

  // 1.3 Purchase
  quantity: { type: Number, min: 0, default: null },
  price: { type: Number, min: 0, default: null },
  priceNotes: { type: String, default: '' },

  // 1.4 Dispensary
  dispensary: {
    name: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // 1.5 Cannabis Form
  cannabisForm: {
    type: String,
    enum: ['', 'flower', 'oil', 'edible', 'extract', 'tincture', 'topical', 'other'],
    default: ''
  },
  customCannabisForm: { type: String, default: '' },
  cannabisFormNotes: { type: String, default: '' },

  // 1.6 Consumption Method
  consumptionMethod: {
    type: String,
    enum: ['', 'smoke', 'vape', 'ingest', 'dab', 'sublingual', 'apply', 'other'],
    default: ''
  },
  customConsumptionMethod: { type: String, default: '' },
  consumptionMethodNotes: { type: String, default: '' },

  // 1.7 Aroma
  aromas: [{
    name: { type: String, required: true },
    strength: { type: Number, min: 1, max: 10, required: true }
  }],
  aromaNotes: { type: String, default: '' },

  // 1.8 Flavor
  flavors: [{
    name: { type: String, required: true },
    strength: { type: Number, min: 1, max: 10, required: true }
  }],
  flavorNotes: { type: String, default: '' },

  // 1.9 Cannabinoids
  cannabinoids: {
    thc:  { type: Number, min: 0, max: 100, default: null },
    cbd:  { type: Number, min: 0, max: 100, default: null },
    thca: { type: Number, min: 0, max: 100, default: null },
    thcv: { type: Number, min: 0, max: 100, default: null },
    cbda: { type: Number, min: 0, max: 100, default: null },
    cbdv: { type: Number, min: 0, max: 100, default: null },
    cbg:  { type: Number, min: 0, max: 100, default: null },
    cbn:  { type: Number, min: 0, max: 100, default: null },
    cbc:  { type: Number, min: 0, max: 100, default: null }
  },

  // 1.10 Terpenes
  terpenes: {
    dominant:   [{ type: String }],
    secondary:  [{ type: String }]
  },

  // 1.11 Dosage
  dosage: {
    amountConsumed:  { type: String, default: '' },
    timesTaken:      { type: Number, min: 1, default: null },
    timeToEffect:    { type: String, default: '' },
    lengthOfEffects: { type: String, default: '' }
  },

  // 1.12 Effects (all 0-10, default 0)
  effects: {
    painRelief:  { type: Number, min: 0, max: 10, default: 0 },
    headache:    { type: Number, min: 0, max: 10, default: 0 },
    energy:      { type: Number, min: 0, max: 10, default: 0 },
    creative:    { type: Number, min: 0, max: 10, default: 0 },
    stressRelief:{ type: Number, min: 0, max: 10, default: 0 },
    dryMouth:    { type: Number, min: 0, max: 10, default: 0 },
    sleepy:      { type: Number, min: 0, max: 10, default: 0 },
    anxious:     { type: Number, min: 0, max: 10, default: 0 },
    crampRelief: { type: Number, min: 0, max: 10, default: 0 },
    dryEyes:     { type: Number, min: 0, max: 10, default: 0 },
    lazy:        { type: Number, min: 0, max: 10, default: 0 },
    focused:     { type: Number, min: 0, max: 10, default: 0 },
    relaxation:  { type: Number, min: 0, max: 10, default: 0 },
    hungry:      { type: Number, min: 0, max: 10, default: 0 },
    uplifted:    { type: Number, min: 0, max: 10, default: 0 },
    peaceful:    { type: Number, min: 0, max: 10, default: 0 }
  },

  // 1.13 Effect Notes
  symptomsRelievedNotes: { type: String, default: '' },
  otherEffectsNotes: { type: String, default: '' },

  // 1.14 Ratings
  medicalRating:       { type: Number, min: 0, max: 10, default: null },
  recreationalRating:  { type: Number, min: 0, max: 10, default: null },

  // 1.15 Images
  flowerImageUrl: { type: String, default: '' },
  coaImageUrls:   [{ type: String }]

}, { timestamps: true });

// Text index for search
entrySchema.index({
  productName: 'text',
  brand: 'text',
  'dispensary.name': 'text',
  aromaNotes: 'text',
  flavorNotes: 'text',
  priceNotes: 'text'
});
```

### CustomOptions Schema

```javascript
const customOptionSchema = new mongoose.Schema({
  type: { type: String, enum: ['aroma', 'flavor'], required: true },
  name: { type: String, required: true, trim: true }
}, { timestamps: true });

// Prevent duplicate custom options
customOptionSchema.index({ type: 1, name: 1 }, { unique: true });
```

---

## 3. API Routes (full specification)

### Auth

| Method | Route | Auth | Request Body | Response | Notes |

|---|---|---|---|---|---|

| POST | `/api/auth/login` | No | `{ password: String }` | `200 { ok: true }` or `401 { ok: false }` | Compares against `process.env.AUTH_PASSWORD` |

### Entries

| Method | Route | Auth | Request/Query | Response | Notes |

|---|---|---|---|---|---|

| GET | `/api/entries` | No | Query: `?page=1&limit=20` | `{ entries: [condensed], total, page, pages }` | Returns ONLY: `_id, productName, flowerImageUrl, terpenes.dominant, createdAt` |

| GET | `/api/entries/search` | No | Query: `?q=searchterm` | `{ entries: [condensed] }` | MongoDB text search on indexed fields |

| GET | `/api/entries/:id` | No | -- | `{ entry: fullObject }` | Full entry for read-only view |

| POST | `/api/entries` | Yes | Full entry body (all 58 fields) | `{ entry: createdObject }` | `createdAt` auto-set, validates all fields |

| PUT | `/api/entries/:id` | Yes | Partial or full update body | `{ entry: updatedObject }` | `updatedAt` auto-set |

| DELETE | `/api/entries/:id` | Yes | -- | `{ ok: true }` | Deletes entry and its Cloudinary images |

### Images

| Method | Route | Auth | Request | Response | Notes |

|---|---|---|---|---|---|

| POST | `/api/upload` | Yes | `multipart/form-data`, field `images` (1+) | `{ urls: [String] }` | Uploads to Cloudinary, returns array of URLs |

### Custom Options

| Method | Route | Auth | Request/Query | Response | Notes |

|---|---|---|---|---|---|

| GET | `/api/options` | No | Query: `?type=aroma` or `?type=flavor` | `{ options: [{ name }] }` | Returns custom options merged with defaults |

| POST | `/api/options` | Yes | `{ type: "aroma"|"flavor", name: String }` | `{ option: created }` | Adds custom option, deduplicates |

### Analytics

| Method | Route | Auth | Request | Response | Notes |

|---|---|---|---|---|---|

| GET | `/api/analytics` | No | -- | `{ strainFrequency, avgRatings, effectsAvg, spendingOverTime, formBreakdown, methodBreakdown, topTerpenes }` | Pre-aggregated data for all charts |

---

## 4. Authentication Detail

- **Backend middleware** (`authCheck`): reads `x-auth-password` header, compares to `process.env.AUTH_PASSWORD`. Returns 401 if mismatch. Applied to POST/PUT/DELETE routes.
- **Frontend**: `AuthContext` with `isAuthenticated` boolean. On login page, user enters password, POST to `/api/auth/login`. If 200, store password in `localStorage.setItem('wd_auth', password)`. On app load, read from localStorage, set context.
- **No encryption, no JWT, no sessions** -- per requirement.
- Protected routes: EntryForm (create), EntryForm (edit). The "Add Entry" and "Edit" buttons only render when `isAuthenticated`.

---

## 5. Frontend Pages and Components

### Pages

1. **LoginPage** -- single password input, reggae background, submit button.
2. **HomePage** --
  - Search bar (debounced, 300ms, hits `/api/entries/search`)
  - "+ Add Entry" button (auth-only)
  - Entry card grid. Each card: flower thumbnail (Cloudinary 200x200 transform), product name, dominant terpenes as tags, "View" link, "Edit" link (auth-only)
  - Pagination or infinite scroll
  - Skeleton loading placeholders
3. **EntryFormPage** (create + edit mode) --
  - Multi-section collapsible accordion form (mobile-friendly)
  - Sections: Product Info, Purchase, Dispensary, Form and Method, Sensory (Aroma + Flavor), Chemistry (Cannabinoids + Terpenes), Dosage, Effects, Ratings, Images
  - Date displayed at top (auto-filled, not editable)
  - Save and Cancel buttons sticky at bottom
4. **EntryViewPage** --
  - Read-only display of all 58 fields, organized in same sections
  - Google Maps embed for dispensary location
  - Image gallery (flower + COA images)
  - "Edit" button (auth-only) at top
5. **AnalyticsPage** -- Charts (see section 7)

### Reusable Components

| Component | Used In | Description |

|---|---|---|

| `EntryCard` | HomePage | Condensed card with image, name, terpenes, links |

| `SensoryPicker` | EntryForm (x2) | Multi-select grid with strength sliders (1-10) + "Add Custom" input. Shared between Aroma and Flavor via props. |

| `EffectsRater` | EntryForm | 16 labeled sliders (0-10), 4-column grid on desktop, 2-column on mobile |

| `StrainList` | EntryForm | Dynamic list of `{ name, type }` with add/remove buttons |

| `ImageUploader` | EntryForm | Tap/click to upload, preview, Cloudinary upload. Props: `multiple` boolean for COA vs flower |

| `TagInput` | EntryForm | For terpene dominant/secondary -- type and enter to add tags |

| `SearchBar` | HomePage | Debounced text input |

| `MapEmbed` | EntryView | Google Maps iframe from location string, fallback to link |

| `SkeletonCard` | HomePage | Shimmer placeholder matching EntryCard dimensions |

| `ProtectedRoute` | App router | Redirects to login if not authenticated |

| `CollapsibleSection` | EntryForm | Accordion section with title, expand/collapse |

---

## 6. Package Requirements

### Root

```json
{
  "devDependencies": {
    "concurrently": "^8.0.0"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "test": "cd server && npm test"
  }
}
```

### Server (`server/package.json`)

| Package | Version | Purpose |

|---|---|---|

| `express` | ^4.18 | HTTP server |

| `mongoose` | ^8.0 | MongoDB ODM |

| `cors` | ^2.8 | CORS middleware |

| `dotenv` | ^16.0 | Env var loading |

| `cloudinary` | ^2.0 | Cloudinary SDK |

| `multer` | ^1.4 | Multipart file upload parsing |

| `compression` | ^1.7 | Gzip/brotli response compression |

| `helmet` | ^7.0 | Security headers |

| `morgan` | ^1.10 | Request logging |

| `express-rate-limit` | ^7.0 | Rate limiting |

Dev dependencies:

| Package | Version | Purpose |

|---|---|---|

| `nodemon` | ^3.0 | Auto-restart on changes |

| `jest` | ^29.0 | Test runner |

| `supertest` | ^6.0 | HTTP assertion library for API tests |

| `mongodb-memory-server` | ^9.0 | In-memory MongoDB for tests (no Atlas needed) |

| `cross-env` | ^7.0 | Cross-platform env vars in scripts |

### Client (`client/package.json`)

| Package | Version | Purpose |

|---|---|---|

| `react` | ^18.0 | UI library |

| `react-dom` | ^18.0 | DOM rendering |

| `react-router-dom` | ^6.0 | Client-side routing |

| `chart.js` | ^4.0 | Charting (analytics page) |

| `react-chartjs-2` | ^5.0 | React wrapper for Chart.js |

Dev dependencies:

| Package | Version | Purpose |

|---|---|---|

| `vite` | ^5.0 | Build tool / dev server |

| `@vitejs/plugin-react` | ^4.0 | React Fast Refresh for Vite |

**No UI framework** (no MUI, no Tailwind) -- hand-written CSS Modules for minimal bundle size.

---

## 7. Analytics Page Charts

| Chart | Type | Data Source |

|---|---|---|

| Top Strains by Frequency | Horizontal bar | Count of entries per strain name |

| Avg Medical vs Recreational Rating by Strain Type | Grouped bar | Average ratings grouped by sativa/indica/hybrid |

| Cannabinoid Ratio Distribution | Stacked bar | Average % of each cannabinoid across all entries |

| Most Common Effects | Radar chart | Average score per effect across all entries |

| Spending Over Time | Line chart | Price summed by month |

| Cannabis Form Breakdown | Doughnut | Count of entries per cannabis form |

| Consumption Method Breakdown | Doughnut | Count of entries per consumption method |

| Top Dominant Terpenes | Horizontal bar | Frequency of each dominant terpene |

---

## 8. Performance Implementation

### Build-time

| Technique | Implementation |

|---|---|

| Code splitting | `React.lazy()` + `Suspense` for each page route in `App.jsx` |

| Tree shaking | Vite handles automatically; avoid barrel imports |

| Minification | Vite production build (esbuild minify) |

| Chunk splitting | Vite `build.rollupOptions.output.manualChunks` -- separate vendor chunk for react, chart.js |

### Runtime

| Technique | Implementation |

|---|---|

| Gzip/Brotli | `compression` middleware in Express, applied before static serving |

| Security headers | `helmet` middleware |

| Image optimization | Cloudinary URL transforms: `f_auto,q_auto,w_400` for cards, `w_800` for detail view |

| Skeleton screens | `SkeletonCard` component rendered while `entries === null` (not empty array -- null means loading) |

| Condensed list endpoint | `/api/entries` returns only `_id, productName, flowerImageUrl, terpenes.dominant, createdAt` via MongoDB projection |

| Static asset caching | Express serves `client/dist` with `Cache-Control: public, max-age=31536000, immutable` for hashed assets |

| Lazy image loading | `<img loading="lazy">` on all images |

| API response caching | `Cache-Control: public, max-age=60` on GET endpoints (short TTL) |

| Rate limiting | `express-rate-limit` on write endpoints (15 req/min) |

### Vite Config

```javascript
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  }
});
```

---

## 9. Theme Specification

| Property | Value |

|---|---|

| Primary dark | `#0D1B0E` (near-black green) |

| Primary green | `#1B5E20` |

| Accent green | `#4CAF50` |

| Accent purple | `#7B1FA2` |

| Gold | `#FFD600` |

| Rasta red | `#D32F2F` (accent only, borders/dividers) |

| Text primary | `#E8F5E9` (light green-white) |

| Text secondary | `#A5D6A7` |

| Card background | `#1A2E1A` |

| Font heading | Google Font "Righteous" (reggae feel) |

| Font body | Google Font "Inter" (clean, fast loading) |

| Border radius | 12px cards, 8px inputs |

| Rasta stripe | 3px horizontal bar (green-gold-red) used as section dividers |

Mobile-first: base styles target 320px+, media queries scale up at 768px and 1024px breakpoints.

---

## 10. Automated API Tests

Tests use **Jest + Supertest + mongodb-memory-server**. No real Atlas or Cloudinary connection needed. The test suite must pass before the plan is considered complete.

### Test File: `server/tests/auth.test.js`

| Test | Method | Route | Assertion |

|---|---|---|---|

| Login with correct password | POST | `/api/auth/login` | 200, `{ ok: true }` |

| Login with wrong password | POST | `/api/auth/login` | 401, `{ ok: false }` |

| Login with missing password | POST | `/api/auth/login` | 401 |

### Test File: `server/tests/entries.test.js`

| Test | Method | Route | Auth | Assertion |

|---|---|---|---|---|

| Create entry with valid data | POST | `/api/entries` | Yes | 201, returns entry with all fields |

| Create entry without auth | POST | `/api/entries` | No | 401 |

| Create entry missing productName | POST | `/api/entries` | Yes | 400, validation error |

| List entries (condensed) | GET | `/api/entries` | No | 200, array with only condensed fields |

| Get single entry (full) | GET | `/api/entries/:id` | No | 200, full entry object |

| Get non-existent entry | GET | `/api/entries/:id` | No | 404 |

| Update entry with auth | PUT | `/api/entries/:id` | Yes | 200, updated fields |

| Update entry without auth | PUT | `/api/entries/:id` | No | 401 |

| Delete entry with auth | DELETE | `/api/entries/:id` | Yes | 200, `{ ok: true }` |

| Delete entry without auth | DELETE | `/api/entries/:id` | No | 401 |

| Search entries | GET | `/api/entries/search?q=term` | No | 200, matching results |

| Validate strain type enum | POST | `/api/entries` | Yes | 400 if strain type is not sativa/indica/hybrid |

| Validate cannabisForm enum | POST | `/api/entries` | Yes | 400 if form is not in enum |

| Validate consumptionMethod enum | POST | `/api/entries` | Yes | 400 if method is not in enum |

| Validate aroma strength range | POST | `/api/entries` | Yes | 400 if strength < 1 or > 10 |

| Validate flavor strength range | POST | `/api/entries` | Yes | 400 if strength < 1 or > 10 |

| Validate effects range | POST | `/api/entries` | Yes | 400 if any effect < 0 or > 10 |

| Validate cannabinoid range | POST | `/api/entries` | Yes | 400 if any cannabinoid < 0 or > 100 |

| Validate medicalRating step | POST | `/api/entries` | Yes | Accepts 7.3, rejects values outside 0-10 |

| Validate recreationalRating | POST | `/api/entries` | Yes | Same as medicalRating |

| Pagination | GET | `/api/entries?page=1&limit=5` | No | Correct total, pages count |

| customCannabisForm required when form=other | POST | `/api/entries` | Yes | 400 if cannabisForm is "other" but customCannabisForm is empty |

| customConsumptionMethod required when method=other | POST | `/api/entries` | Yes | 400 if consumptionMethod is "other" but customConsumptionMethod is empty |

### Test File: `server/tests/options.test.js`

| Test | Method | Route | Auth | Assertion |

|---|---|---|---|---|

| Get default aroma options | GET | `/api/options?type=aroma` | No | 200, includes all 10 defaults |

| Get default flavor options | GET | `/api/options?type=flavor` | No | 200, includes all 10 defaults |

| Add custom aroma | POST | `/api/options` | Yes | 201, persisted |

| Add custom flavor | POST | `/api/options` | Yes | 201, persisted |

| Custom aroma appears in GET | GET | `/api/options?type=aroma` | No | Includes previously added custom |

| Duplicate custom option rejected | POST | `/api/options` | Yes | 409 or idempotent 200 |

| Add option without auth | POST | `/api/options` | No | 401 |

### Test File: `server/tests/analytics.test.js`

| Test | Method | Route | Assertion |

|---|---|---|---|

| Returns analytics shape | GET | `/api/analytics` | 200, has all expected keys |

| Analytics with no entries | GET | `/api/analytics` | 200, empty/zero values, no crash |

| Analytics with entries | GET | `/api/analytics` | 200, computed aggregations match test data |

### Test Setup (`server/tests/setup.js`)

- `beforeAll`: start `mongodb-memory-server`, connect mongoose
- `afterEach`: clear all collections
- `afterAll`: disconnect mongoose, stop memory server
- `AUTH_PASSWORD` env var set to `"test-password"` for test runs

### Running Tests

```bash
cd server
npm test          # runs jest with --detectOpenHandles --forceExit
npm test -- --verbose   # detailed output
```

Jest config in `server/package.json`:

```json
{
  "scripts": {
    "test": "cross-env AUTH_PASSWORD=test-password jest --detectOpenHandles --forceExit",
    "dev": "nodemon index.js"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterSetup": ["./tests/setup.js"]
  }
}
```

---

## 11. Setup Docs (setup.md)

Will be created at `[setup.md](setup.md)` covering step-by-step free tier setup:

### MongoDB Atlas Free Tier (M0)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Click "Build a Database" and select the **M0 Free** tier (shared, 512 MB)
3. Choose your preferred cloud provider and region (any works)
4. Set a cluster name (e.g., `weed-diary-cluster`)
5. Under "Database Access", create a database user with username/password and "Read and write to any database" role
6. Under "Network Access", click "Add IP Address":
  - For development: add `0.0.0.0/0` (allows all IPs)
  - For production: add your server's IP only
7. Go to "Database" > "Connect" > "Connect your application"
8. Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/weed-diary`
9. Replace `<username>` and `<password>` with your database user credentials
10. Paste into `.env` as `MONGODB_URI`

### Cloudinary Free Tier

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) and create a free account
2. Free tier includes: 25 credits/month (approx 25 GB storage + 25 GB bandwidth + 25,000 transformations)
3. After signup, you land on the Dashboard
4. Copy three values from the Dashboard:
  - **Cloud Name** (top of dashboard, e.g., `dxyz1234`)
  - **API Key** (numeric string)
  - **API Secret** (click "Reveal" to see)
5. Paste into `.env`:

```
   CLOUDINARY_CLOUD_NAME=dxyz1234
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret-here
   

```

1. Optional: in Cloudinary Settings > Upload, create an upload preset named `weed-diary` with folder `weed-diary/` for organization

### Google Maps Embed API (optional, free)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com) and create a project (or select existing)
2. Navigate to "APIs and Services" > "Library"
3. Search for "Maps Embed API" and click "Enable" (this is free, no billing required for embed-only usage)
4. Go to "APIs and Services" > "Credentials" > "Create Credentials" > "API Key"
5. Restrict the key: under "API restrictions", select "Maps Embed API" only
6. Under "Application restrictions", add your domain (or leave unrestricted for dev)
7. Copy the API key and paste into `.env` as `GOOGLE_MAPS_API_KEY`
8. If you skip this step, the app will fall back to a plain Google Maps link instead of an embedded map

---

## 12. Project File Tree (complete)

```
weed-diary/
  package.json                  # root scripts (dev, build, start, test)
  .env.example                  # template with all env vars
  setup.md                      # free tier setup guide
  client/
    index.html
    vite.config.js
    package.json
    src/
      main.jsx                  # ReactDOM.createRoot
      App.jsx                   # Router + lazy-loaded pages
      context/
        AuthContext.jsx          # isAuthenticated, login, logout
      hooks/
        useAuth.js              # useContext(AuthContext) shorthand
        useEntries.js           # fetch, create, update, delete entries
        useAnalytics.js         # fetch analytics data
        useOptions.js           # fetch/add custom aroma/flavor options
      pages/
        LoginPage.jsx
        HomePage.jsx
        EntryFormPage.jsx       # create + edit (mode prop or route param)
        EntryViewPage.jsx       # read-only detail
        AnalyticsPage.jsx
      components/
        EntryCard.jsx
        SkeletonCard.jsx
        SearchBar.jsx
        SensoryPicker.jsx       # reused for aroma + flavor
        EffectsRater.jsx
        StrainList.jsx
        ImageUploader.jsx
        TagInput.jsx
        MapEmbed.jsx
        CollapsibleSection.jsx
        ProtectedRoute.jsx
      styles/
        variables.css           # CSS custom properties (theme)
        global.css              # resets, fonts, base
        HomePage.module.css
        EntryForm.module.css
        EntryView.module.css
        Analytics.module.css
        Login.module.css
        components/             # CSS Modules per component
      utils/
        api.js                  # fetch wrapper with auth header
        constants.js            # enums, default options lists
        formatters.js           # date, currency, percentage helpers
  server/
    index.js                    # Express app entry point
    package.json
    config/
      db.js                     # Mongoose connection
      cloudinary.js             # Cloudinary SDK config
    middleware/
      authCheck.js              # x-auth-password header check
    models/
      Entry.js                  # Mongoose Entry schema
      CustomOption.js           # Mongoose CustomOption schema
    routes/
      auth.js                   # POST /api/auth/login
      entries.js                # CRUD + search
      upload.js                 # POST /api/upload
      options.js                # GET/POST /api/options
      analytics.js              # GET /api/analytics
    utils/
      cloudinaryUpload.js       # upload helper
    tests/
      setup.js                  # mongodb-memory-server lifecycle
      auth.test.js
      entries.test.js
      options.test.js
      analytics.test.js
```

---

## 13. Implementation Order

Build in this sequence so each step is testable before moving on.