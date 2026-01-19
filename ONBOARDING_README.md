# Newsletter Funnel Onboarding Flow

A comprehensive lead-magnet onboarding flow for generating custom newsletter funnel plans. Built with vanilla JavaScript, EJS templating, and the Web Speech API for voice input.

## Features

- ✅ **Multi-step wizard** with 7 steps + thank you page
- ✅ **Email capture** upfront - tells users where their plan will be sent
- ✅ **Voice input support** for ICP and goal questions (Web Speech API)
- ✅ **Progress indicator** showing current step
- ✅ **State persistence** via sessionStorage (survives refresh)
- ✅ **Topic selection** with cloud UI (suggested + custom topics, up to 3)
- ✅ **Content source collection** - gather URLs to existing content (LinkedIn, Twitter, Blog, YouTube, Podcast, etc.)
- ✅ **Design direction** selection with preview images
- ✅ **Revenue strategy** multi-select with optional notes
- ✅ **API adapter pattern** for easy backend integration (mock + fetch implementations)
- ✅ **Mobile-friendly** responsive design
- ✅ **Loading & error states** for all async operations

## Files Structure

```
├── templates/pages/newsletter-funnel-onboarding.ejs  # Main EJS template
├── onboarding.css                                     # Onboarding-specific styles
├── js/onboarding/
│   ├── state-manager.js                              # State & navigation management
│   ├── voice-input.js                                # Web Speech API integration
│   ├── topic-chips.js                                # Topic selection UI
│   ├── section-selection.js                          # Section cards UI
│   ├── recommendations-adapter.js                    # API adapter (mock + fetch)
│   └── app.js                                        # Main orchestrator
└── ONBOARDING_README.md                               # This file
```

## Quick Start

### 1. Integration into Your Site

To add the onboarding flow to your site:

1. **Create a new page route** in your build system that uses the `newsletter-funnel-onboarding.ejs` template

2. **Include the CSS** by adding to your page's `additionalCSS` array:
   ```javascript
   additionalCSS: ['onboarding.css']
   ```

3. **The JavaScript modules** are already referenced in the EJS template and will load automatically

### 2. Configure the Layout

The onboarding template expects to be rendered with your existing `layout.ejs`. Here's an example of how to configure it in your build script:

```javascript
// In build-site.js or similar
const onboardingPage = {
  title: 'Newsletter Funnel Generator | Potions',
  description: 'Get your custom newsletter funnel plan',
  keywords: 'newsletter, B2B marketing, lead generation',
  author: 'Potions',
  additionalCSS: ['onboarding.css'],
  scripts: [], // Scripts are loaded in the template itself
  hideHeaderFooter: true, // Optional: hide header/footer for cleaner flow
  tracking: true
};
```

### 3. Toggle Between Mock and Real API

Open `js/onboarding/recommendations-adapter.js` and change the config flag:

```javascript
// Line 10
const USE_MOCK_ADAPTER = true;  // Set to false to use real API endpoints
```

**Mock mode (default):**
- Returns realistic sample data
- Simulates 1.5-2 second delays
- Occasional random errors (5% chance) to test error handling
- Perfect for development and demos

**Fetch mode:**
- Makes real HTTP requests to configured endpoints
- Requires backend implementation

## API Integration

### Endpoints Configuration

Configure your API endpoints in `js/onboarding/recommendations-adapter.js`:

```javascript
// Lines 12-16
const API_ENDPOINTS = {
  topics: '/api/recommendations/topics',        // POST
  sections: '/api/recommendations/sections',    // POST
  submit: '/api/onboarding/submit'             // POST
};
```

### Expected API Response Shapes

#### 1. Topic Recommendations

**Endpoint:** `POST /api/recommendations/topics`

**Request:**
```json
{
  "icp": "Mid-market B2B SaaS companies...",
  "goal": "Generate qualified leads for sales team"
}
```

**Response:**
```json
{
  "topics": [
    {
      "id": "ai-automation",
      "label": "AI & Automation",
      "reason": "Highly relevant for B2B SaaS audience"
    }
  ]
}
```

**Fields:**
- `id` (string, required): Unique identifier
- `label` (string, required): Display text for the topic chip
- `reason` (string, optional): Why this topic was recommended

---

#### 2. Submit Onboarding

**Endpoint:** `POST /api/onboarding/submit`

**Request:**
```json
{
  "email": "user@company.com",
  "icp": "Mid-market B2B SaaS companies...",
  "goal": "Generate qualified leads for sales team",
  "topics": ["AI & Automation", "Product Strategy"],
  "contentSources": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "blog": "https://myblog.com",
    "twitter": "https://twitter.com/johndoe"
  },
  "designDirection": "editorial",
  "acquisitionChannels": ["meta-ads", "cold-email"],
  "acquisitionNotes": "Currently spending $5k/mo on Meta ads..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Onboarding submitted successfully"
}
```

**Request fields:**
- `email` (string, required): User's email address (validated format)
- `icp` (string): Ideal customer profile description
- `goal` (string): Newsletter goal description
- `topics` (array of strings): Selected topic labels
- `contentSources` (object): URLs to existing content platforms. Keys can be: `linkedin`, `twitter`, `blog`, `youtube`, `podcast`, `other`. Example: `{ "linkedin": "https://...", "blog": "https://..." }`
- `designDirection` (string): One of `"editorial"`, `"playful"`, or `"minimal"`
- `acquisitionChannels` (array of strings): Selected channels (e.g., `"meta-ads"`, `"cold-email"`, `"referrals"`)
- `acquisitionNotes` (string, optional): Additional notes from user

---

## Design Assets Configuration

### Newsletter Design Samples

To update the sample newsletter links and preview images for Step 5 (Design Direction):

1. **Open:** `templates/pages/newsletter-funnel-onboarding.ejs`

2. **Locate:** Lines ~220-260 (the design options section)

3. **Update images:** Replace the `src` attributes in the `<img>` tags:
   ```html
   <img src="/samples/editorial-preview.png" alt="Editorial design preview" />
   ```

4. **Update sample links:** Replace the `href` attributes in the `<a>` tags:
   ```html
   <a href="https://example.com/editorial-sample" class="sample-link" target="_blank">
     View sample →
   </a>
   ```

**Recommended image size:** 400x300px (or similar 4:3 ratio)

---

## Customization

### Changing the Max Topic/Section Limits

**Topics (default: 3):**
```javascript
// In js/onboarding/app.js, line ~68
this.topicChipsManager = new TopicChipsManager('#topic-cloud', 3);
```

**Sections (default: 3):**
```javascript
// In js/onboarding/app.js, line ~133
this.sectionSelectionManager = new SectionSelectionManager('#sections-grid', 3);
```

### Updating Contact Email & Booking Link

**Contact email** (Thank You page):
```html
<!-- Line ~291 in newsletter-funnel-onboarding.ejs -->
<a href="mailto:evan@withpotions.com">evan@withpotions.com</a>
```

**Booking link** (Thank You page):
```html
<!-- Line ~303 in newsletter-funnel-onboarding.ejs -->
<a href="https://calendly.com/PLACEHOLDER-BOOKING-LINK" ... >
```

### Customizing Copy

All copy is in the EJS template (`newsletter-funnel-onboarding.ejs`). Simply edit the HTML to update:

- Step titles (`<h1>` tags)
- Helper text (`.step-helper` paragraphs)
- Button labels
- Thank you page messaging

### Styling Customization

**Colors:**
The design uses your existing color scheme:
- Primary: `#5D5DED` (purple)
- Accent: `#F5C7EB` (pink)
- Borders: `#333` (dark gray)
- Background: `white`

To change colors, edit `onboarding.css` and search for the hex codes above.

**Fonts:**
The onboarding inherits your site's `Prosa-Light` font family.

**Mobile breakpoints:**
- Tablet: `768px`
- Mobile: `480px`

---

## Voice Input

### Browser Support

Voice input uses the Web Speech API, which is supported in:

- ✅ **Chrome** (desktop & mobile)
- ✅ **Edge** (desktop & mobile)
- ✅ **Safari** (desktop & mobile)
- ❌ **Firefox** (not supported)

**Graceful degradation:**
- Unsupported browsers will see a disabled mic button with an explanatory message
- Users can still type their answers

### Customizing Voice Input Language

Default language is `en-US`. To change:

```javascript
// In js/onboarding/voice-input.js, line ~34
this.recognition.lang = 'en-US';  // Change to 'en-GB', 'es-ES', etc.
```

---

## State Persistence

The onboarding automatically saves all user input to `sessionStorage`:

- **Survives:** Page refresh, back/forward navigation
- **Cleared:** When user closes the tab/window
- **Storage keys:**
  - `onboarding_state` - All form data
  - `onboarding_current_step` - Current step number

To manually clear state (e.g., after testing):

```javascript
// In browser console
sessionStorage.removeItem('onboarding_state');
sessionStorage.removeItem('onboarding_current_step');
location.reload();
```

Or programmatically:

```javascript
window.onboardingApp.stateManager.clearState();
```

---

## Testing

### Local Testing Checklist

1. **Voice input:**
   - Click mic button → should show "Listening..."
   - Speak → should transcribe to textarea
   - Click again → should stop listening
   - Test in unsupported browser (Firefox) → should show error message

2. **State persistence:**
   - Fill in Step 1, refresh page → should restore Step 1 input
   - Progress to Step 3, refresh → should return to Step 3 with data intact

3. **Topic selection:**
   - Select 3 topics → should disable remaining chips
   - Deselect one → should enable chips again
   - Add custom topic → should appear in cloud
   - Try to add duplicate → should show error

4. **Section selection:**
   - On load → 3 recommended sections should be preselected
   - Select/deselect → should update count
   - Select 3 sections → should disable remaining cards

5. **Form validation:**
   - Leave Step 1 empty → Next button should be disabled
   - Enter text → Next button should enable
   - Submit without selections → buttons should enforce rules

6. **API simulation (mock mode):**
   - Step 2 → Step 3 → should show loading spinner → should render topics
   - Step 3 → Step 4 → should show loading spinner → should render sections
   - Occasionally should see error state (5% chance)

### Mock Data Customization

To change mock data for testing:

Edit `js/onboarding/recommendations-adapter.js`:

- **Topics:** Lines 22-51 (`MOCK_TOPICS`)
- **Sections:** Lines 53-103 (`CANONICAL_SECTIONS`)
- **Recommended sections:** Lines 105-131 (`MOCK_RECOMMENDED_SECTIONS`)

---

## Deployment

### Pre-deployment Checklist

- [ ] Update sample newsletter links and images
- [ ] Update contact email address
- [ ] Update booking link (remove `PLACEHOLDER`)
- [ ] Configure API endpoints
- [ ] Set `USE_MOCK_ADAPTER = false`
- [ ] Test all API endpoints return correct data shapes
- [ ] Test on mobile devices
- [ ] Test voice input in Chrome, Safari, Edge
- [ ] Verify error handling with network failures
- [ ] Check analytics/tracking integration
- [ ] Test submission flow end-to-end

### Production API Considerations

1. **Rate limiting:** Implement rate limits on recommendation endpoints
2. **Validation:** Validate all inputs server-side
3. **Email notifications:** Send confirmation email after submission
4. **CRM integration:** Sync submitted data to your CRM/database
5. **Monitoring:** Log API failures and track completion rates

---

## Troubleshooting

### Voice input not working

- **Check browser support:** Use Chrome, Edge, or Safari
- **Check HTTPS:** Web Speech API requires HTTPS (localhost is OK)
- **Check microphone permissions:** User must grant permission
- **Console errors:** Open DevTools → Console to see specific errors

### State not persisting

- **Check sessionStorage:** Browser privacy settings might block it
- **Incognito mode:** sessionStorage works but clears when window closes
- **Console check:** Run `sessionStorage.getItem('onboarding_state')` to inspect

### Topics/sections not loading

- **Check API adapter mode:** Verify `USE_MOCK_ADAPTER` setting
- **Check network tab:** Look for failed requests (if using fetch mode)
- **Check console:** Look for error messages
- **Mock errors:** In mock mode, there's a 5% random error rate—retry should work

### Styling issues

- **CSS not loading:** Verify `onboarding.css` is in your page's `additionalCSS`
- **Check browser DevTools:** Inspect elements to see applied styles
- **Cache issues:** Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

## Support

For questions or issues with this onboarding flow, check:

1. This README
2. Code comments in the JavaScript modules
3. Browser console for error messages
4. Network tab for API request/response debugging

---

## License

This onboarding flow is part of the Potions website codebase.
