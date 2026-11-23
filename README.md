# Mini Checkout & Playwright Browser Test Suite

A single-page checkout application and browser test suite built with **Playwright Test** and standard web technologies (HTML5, CSS3, Vanilla JS).

Built with clear assertions, explicit test cases, and reproducible results for the hiring-hackathon submission.

---

## 1. Tech Stack & Architecture
- **Application Frontend**: Vanilla JavaScript (ES6+), Semantic HTML5, Modular CSS3.
- **Server**: Zero-dependency Node.js HTTP static server (`server.js`).
- **Test Automation**: Playwright Test (`@playwright/test` v1.49+) on Chromium desktop.
- **Design Philosophy**:
  - Zero external UI libraries, zero build steps, zero frontend framework overhead.
  - Zero floating-point arithmetic errors: all money values are handled as whole integers in Indian Rupees (₹).
  - Web-first assertions only: zero arbitrary `waitForTimeout` or sleeps.

---

## 2. Prerequisites
- **Node.js**: v18.0.0 or later (verified on Node v24.11.0).
- **npm**: v9.0.0 or later.
- OS: Windows, macOS, or Linux.

---

## 3. Quick Start (Reproduce Everything in < 3 Minutes)

### Step 1: Install Dependencies & Browser Binaries
```bash
npm install
npx playwright install chromium
```

### Step 2: Start the Application (Optional for Manual Browsing)
```bash
npm start
```
Open [http://127.0.0.1:3000/](http://127.0.0.1:3000/) in any modern browser.

*(Note: When executing Playwright tests via `npm test`, Playwright automatically manages the local web server lifecycle using the `webServer` configuration in `playwright.config.js`).*

---

## 4. Running the Automated Tests

### 4.1 Run Required Smoke Tests (@smoke)
Executes the three primary user journeys (successful checkout, missing field block, quantity recalculation):
```bash
npm run test:smoke
```

### 4.2 Run the Full Test Suite (14 Tests)
Executes all smoke and regression tests (boundary values, double-clicks, concurrent bursts, accessibility, reset flow):
```bash
npm test
```

### 4.3 Run in Headed Mode (Visual Watch)
Runs tests with Chromium visible:
```bash
npm run test:headed
```

### 4.4 View Interactive Playwright HTML Report
```bash
npm run test:report
```

### 4.5 Generate Manual Test Evidence Screenshots
Captures high-resolution, full-page screenshots for all key exploratory scenarios directly into `/evidence`:
```bash
npm run generate:evidence
```

---

## 5. Folder Structure
```text
mini-checkout-test-suite/
├── index.html               # Semantic, accessible single-page checkout markup
├── styles.css               # Clean, calm UI stylesheet with accessibility states
├── app.js                   # Application state, integer arithmetic, and double-submit lock
├── server.js                # Zero-dependency local HTTP static server
├── package.json             # Scripts and Playwright test dependencies
├── playwright.config.js     # Playwright configuration (webServer, Chromium, HTML/JUnit)
├── evidence/                # High-resolution screenshot evidence for manual test log
│   ├── 01-empty-cart-validation.png
│   ├── 02-missing-name-validation.png
│   ├── 03-combined-validation-errors.png
│   ├── 04-quantity-update.png
│   ├── 05-successful-checkout.png
│   ├── 06-double-click-prevention.png
│   └── 07-5x-click-burst.png
├── tests/
│   └── checkout.spec.js     # Complete 14-test suite (Smoke & Regression)
├── scripts/
│   └── capture-evidence.js  # Automated evidence capture script for manual scenarios
└── docs/
    ├── TEST_PLAN.md         # Comprehensive test plan, risks, and traceability matrix
    └── TEST_RESULTS.md      # Execution logs, stability metrics, mutation check, and defect log
```

---

## 6. Key Design Decisions

### 1. Integer-Only Currency (No Floating-Point Precision Flaws)
In JavaScript, `0.1 + 0.2 === 0.30000000000000004`. In financial and e-commerce workflows, floating-point math causes rounding bugs and mismatch between displayed line totals and order sums. We store all catalog prices (Notebook: ₹120, Pen: ₹80) and line totals as pure integers, formatting only at presentation time.

### 2. Synchronous Double-Submit Guard
In rapid-click, double-click, or network delay scenarios, asynchronous state locks allow race conditions where multiple requests enter the execution pipeline before the lock takes effect. Our implementation locks state **synchronously on the main thread** (`isSubmitting = true; isSubmitted = true; placeOrderBtn.disabled = true;`) before rendering the confirmation screen. Concurrency tests (rapid double-click and 5x click bursts) prove zero duplicate confirmations.

### 3. Accessible HTML5 & WAI-ARIA
- Semantic forms with explicit `<label for="customer-name">` associations.
- `aria-required="true"` and reactive `aria-invalid="true"` attributes on invalid inputs.
- `role="alert"` with `aria-live` regions for validation messages.
- Full keyboard support (Tab, Enter, Space) and high-contrast `:focus-visible` styling.

### 4. Overcoming CSS Grid / `hidden` Specificity (Defect DEF-001)
Modern CSS display values (`display: grid` or `display: flex`) override the browser's default `[hidden] { display: none; }` user-agent style due to specificity rules. Adding `[hidden] { display: none !important; }` ensures views are definitively hidden when deactivated.

### 5. Web-First Playwright Assertions (Zero Sleeps)
Tests rely exclusively on Playwright's locator assertions (`toBeVisible()`, `toHaveText()`, `toHaveValue()`, `toHaveCount()`, `toBeDisabled()`). No `page.waitForTimeout()` or artificial delays are used, guaranteeing deterministic runs without race conditions.

---

## 7. Assumptions & Limitations
- **Currency**: Fixed to Indian Rupees (INR, `₹`).
- **Data Persistence**: In accordance with the project brief, there is no database, backend API, or payment gateway. State resets upon refreshing the page or clicking "Start a new order".
- **Quantity Range**: Enforced between 1 and 99 units per line item.

---

## 8. Verification & Test Evidence
- Detailed test cases, risk assessments, and traceability tables are available in [docs/TEST_PLAN.md](file:///a:/hackthons/fynd%20hacks/docs/TEST_PLAN.md).
- Real observed test execution logs, 3-run stability verification, mutation check results, and defect logs are documented in [docs/TEST_RESULTS.md](file:///a:/hackthons/fynd%20hacks/docs/TEST_RESULTS.md).
- Visual proof of manual exploratory testing is saved in the [evidence](file:///a:/hackthons/fynd%20hacks/evidence) folder.
