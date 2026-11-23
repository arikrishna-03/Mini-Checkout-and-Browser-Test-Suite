# Mini Checkout Test Execution Results & Report

## 1. Executive Summary
All automated and exploratory test suites have been executed against the Mini Checkout application. The test suite contains **14 automated tests** (3 Smoke tests, 11 Regression tests) built with Playwright Test on Chromium.

- **Total Automated Tests**: 14
- **Passed**: 14 (100%)
- **Failed**: 0
- **Flaky / Retries**: 0
- **Suite Execution Duration**: ~4.1 seconds
- **Consecutive Stability Runs**: 3 consecutive runs passed with 100% success rate (Run 1: 4.3s, Run 2: 4.2s, Run 3: 4.1s).
- **Double-Click Concurrency Stress Test**: 5 consecutive repetitions with 5 parallel workers passed (2.6s).
- **Manual Exploratory Testing**: 7 scenarios executed; reproducible high-resolution evidence captured to `/evidence`.
- **Mutation Verification Check**: 3 intentional faults introduced; all 3 correctly caught by matching test assertions.

---

## 2. Test Execution Environment
- **Date & Time**: 2026-11-23T10:17:50+05:30
- **Operating System**: Windows 11 (build x64)
- **Node.js**: v24.11.0
- **npm**: 11.6.1
- **Playwright Test**: v1.49.0
- **Browser**: Chromium 159.0.8154.6
- **Local Server**: Node.js zero-dependency HTTP server running at `http://127.0.0.1:3000/`

---

## 3. Automated Suite Execution Details

### 3.1 Smoke Test Execution (`npm run test:smoke`)
```text
> mini-checkout-test-suite@1.0.0 test:smoke
> playwright test --grep @smoke

Running 3 tests using 3 workers

  ok 1 [chromium] › tests\checkout.spec.js:45:3 › Mini Checkout Suite › missing name blocks checkout and shows a validation message @smoke (589ms)
  ok 3 [chromium] › tests\checkout.spec.js:14:3 › Mini Checkout Suite › successful checkout shows a confirmation with a valid reference @smoke (614ms)
  ok 2 [chromium] › tests\checkout.spec.js:69:3 › Mini Checkout Suite › changing quantity updates line total and order total to the exact amount @smoke (760ms)

  3 passed (2.8s)
```

### 3.2 Full Suite Execution (`npm test`)
```text
> mini-checkout-test-suite@1.0.0 test
> playwright test

Running 14 tests using 8 workers

  ok  3 [chromium] › tests\checkout.spec.js:137:3 › Mini Checkout Suite › both empty cart and missing name errors display simultaneously @regression (1.1s)
  ok  1 [chromium] › tests\checkout.spec.js:14:3 › Mini Checkout Suite › successful checkout shows a confirmation with a valid reference @smoke (1.2s)
  ok  2 [chromium] › tests\checkout.spec.js:104:3 › Mini Checkout Suite › empty cart blocks checkout and displays validation error @regression (1.3s)
  ok  5 [chromium] › tests\checkout.spec.js:69:3 › Mini Checkout Suite › changing quantity updates line total and order total to the exact amount @smoke (1.3s)
  ok  6 [chromium] › tests\checkout.spec.js:121:3 › Mini Checkout Suite › whitespace-only name blocks checkout and shows validation message @regression (1.2s)
  ok  4 [chromium] › tests\checkout.spec.js:45:3 › Mini Checkout Suite › missing name blocks checkout and shows a validation message @smoke (1.4s)
  ok  7 [chromium] › tests\checkout.spec.js:148:3 › Mini Checkout Suite › customer name is preserved after failed checkout attempt @regression (1.2s)
  ok  8 [chromium] › tests\checkout.spec.js:160:3 › Mini Checkout Suite › cart items and quantities are preserved after failed checkout attempt @regression (1.4s)
  ok  9 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (757ms)
  ok 10 [chromium] › tests\checkout.spec.js:206:3 › Mini Checkout Suite › rapid 5x burst clicks on place order produce exactly one confirmation @regression (719ms)
  ok 12 [chromium] › tests\checkout.spec.js:252:3 › Mini Checkout Suite › quantity boundaries and invalid inputs clamp correctly between 1 and 99 @regression (774ms)
  ok 14 [chromium] › tests\checkout.spec.js:318:3 › Mini Checkout Suite › keyboard-only checkout navigation using Tab and Enter @regression (766ms)
  ok 11 [chromium] › tests\checkout.spec.js:230:3 › Mini Checkout Suite › removing an item from cart updates the total and cart display @regression (903ms)
  ok 13 [chromium] › tests\checkout.spec.js:282:3 › Mini Checkout Suite › starting a new order resets cart, customer name, and submission lock @regression (917ms)

  14 passed (4.1s)
```

### 3.3 Flakiness & Stability Verification
To prove zero flakiness and high reliability under concurrency:
1. **Full Suite 3-Run Sequence**:
   - Run 1: 14 passed (4.3s)
   - Run 2: 14 passed (4.2s)
   - Run 3: 14 passed (4.1s)
2. **Double-Click Concurrency Stress Test** (`npx playwright test -g "rapid double-click" --repeat-each=5`):
   ```text
   Running 5 tests using 5 workers
     ok 5 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (903ms)
     ok 4 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (786ms)
     ok 1 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (983ms)
     ok 2 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (876ms)
     ok 3 [chromium] › tests\checkout.spec.js:179:3 › Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression (891ms)

     5 passed (2.6s)
   ```

---

## 4. Manual Testing Log & Evidence

All manual exploratory checks were carried out in a live Chromium browser session using `npm run generate:evidence`. High-resolution full-page evidence screenshots are preserved in the `/evidence` directory.

| Scenario ID | Test Scenario Description | Observed Result | Evidence Screenshot |
| :--- | :--- | :--- | :--- |
| **MAN-01** | Empty cart + Place Order with customer name filled | Application blocked submission. Displayed clear alert `"Your cart is empty. Please add at least one item to proceed."` under `cart-error`. Customer name remained untouched. | [evidence/01-empty-cart-validation.png](file:///a:/hackthons/fynd%20hacks/evidence/01-empty-cart-validation.png) |
| **MAN-02** | Missing customer name with items in cart | Application blocked submission. Displayed field validation error `"Please enter your name to complete checkout."` under `name-error`. Customer input marked with `aria-invalid="true"`. Cart remained intact. | [evidence/02-missing-name-validation.png](file:///a:/hackthons/fynd%20hacks/evidence/02-missing-name-validation.png) |
| **MAN-03** | Simultaneous empty cart and missing name | Both `cart-error` alert and `name-error` alert rendered simultaneously. Confirmation card remained hidden. No data was cleared. | [evidence/03-combined-validation-errors.png](file:///a:/hackthons/fynd%20hacks/evidence/03-combined-validation-errors.png) |
| **MAN-04** | Quantity changes via `+`/`-` buttons and direct input | 2 notebooks (₹240) + 3 gel pens (₹240) recalculated immediately to exact order total of ₹480 with zero floating point variance. | [evidence/04-quantity-update.png](file:///a:/hackthons/fynd%20hacks/evidence/04-quantity-update.png) |
| **MAN-05** | Successful order checkout | Order confirmed immediately. Displayed customer name ("Ananya Sen"), exact total ("₹120"), and unique reference format ("ORD-XXXXXX"). Checkout form hidden. | [evidence/05-successful-checkout.png](file:///a:/hackthons/fynd%20hacks/evidence/05-successful-checkout.png) |
| **MAN-06** | Rapid double-click on "Place Order" button | Synchronous lock triggered immediately. Button disabled instantly. Exactly one confirmation card rendered. Single stable order reference generated. | [evidence/06-double-click-prevention.png](file:///a:/hackthons/fynd%20hacks/evidence/06-double-click-prevention.png) |
| **MAN-07** | 5x concurrent burst clicking on "Place Order" | All subsequent click events rejected by client-side lock. Exactly one order confirmation rendered with total ₹80. | [evidence/07-5x-click-burst.png](file:///a:/hackthons/fynd%20hacks/evidence/07-5x-click-burst.png) |

---

## 5. Mutation Check Verification (Proof of Trustworthy Tests)

To prove that the assertions are sensitive and trustworthy (and not passing vacuously), three distinct intentional mutations were introduced into the application code and verified against the test suite:

### Mutation 1: Incorrect Product Pricing
- **Injected Mutation**: Changed notebook price from `120` to `150` in `app.js`.
- **Observed Test Failures**:
  - `Mini Checkout Suite › successful checkout shows a confirmation with a valid reference @smoke`
    - Failure details: `Error: expect(locator).toHaveText(expected) failed. Expected: "₹120", Received: "₹150"`.
  - `Mini Checkout Suite › changing quantity updates line total and order total to the exact amount @smoke`
    - Failure details: `Error: expect(locator).toHaveText(expected) failed. Expected: "₹120", Received: "₹150"`.
- **Result**: Mutation correctly caught by exact money assertions. Reverted.

### Mutation 2: Bypassing Customer Name Validation
- **Injected Mutation**: Commented out `if (!nameVal)` validation block in `app.js`.
- **Observed Test Failures**:
  - `Mini Checkout Suite › missing name blocks checkout and shows a validation message @smoke`
    - Failure details: `Error: expect(locator).toBeVisible() failed. Locator: getByTestId('name-error'). Expected: visible, Received: hidden`.
  - `Mini Checkout Suite › both empty cart and missing name errors display simultaneously @regression`
    - Failure details: `Error: expect(locator).toBeVisible() failed. Locator: getByTestId('name-error')`.
- **Result**: Mutation correctly caught by visibility assertions. Reverted.

### Mutation 3: Removing Double-Submit Lock
- **Injected Mutation**: Commented out `if (isSubmitting || isSubmitted) return false;` and `placeOrderBtn.disabled = true;` in `app.js`.
- **Observed Test Failure**:
  - `Mini Checkout Suite › rapid double-click on place order produces exactly one confirmation and reference @regression`
    - Failure details: `Error: expect(locator).toBeDisabled() failed. Expected: disabled, Received: enabled`.
- **Result**: Mutation correctly caught by lock state assertion. Reverted.

---

## 6. Real Defects Identified & Resolved

During test implementation and cross-browser validation, the following real defect was discovered and resolved:

### Defect ID: DEF-001
- **Title**: Checkout form remained visible beneath the confirmation card due to CSS Grid specificity overriding the HTML5 `hidden` attribute.
- **Severity**: High (Visual / Functional Collision)
- **Environment**: Chromium 159.0.8154.6, Windows 11
- **Steps to Reproduce**:
  1. Add Ruled notebook to cart.
  2. Enter customer name "Ananya Sen".
  3. Click "Place Order".
- **Expected Result**: `#checkout-view` has attribute `hidden` and is completely hidden from the viewport (`toBeHidden()`).
- **Actual Result**: `#checkout-view` had attribute `hidden=""`, but its CSS class `.checkout-grid { display: grid; }` had higher specificity than the browser's default user-agent rule `[hidden] { display: none; }`, causing both views to render concurrently.
- **Root Cause**: Modern CSS layout classes (`display: grid` / `display: flex`) override HTML5 `hidden` without an explicit stylesheet declaration.
- **Resolution**: Added `[hidden] { display: none !important; }` in `styles.css`.
- **Verification**: Confirmed via automated test `TC-SMK-01` (`await expect(page.locator('#checkout-view')).toBeHidden();`).

*Note on other defects*: Strictly adhering to the hiring-hackathon brief's integrity requirement ("Report real defects if found; do not invent one"), **no further defects were found** in the application.

---

## 7. Known Gaps & Future Recommendations
1. **Multi-Currency Support**: Currently hardcoded to INR (`₹`). If expanding internationally, an ISO currency formatter (`Intl.NumberFormat`) should be introduced.
2. **Cart Item Deletion Confirmation**: Currently items are removed immediately upon clicking "Remove". For larger carts, an undo snackbar or confirmation toast could enhance user experience.
3. **Session Persistence**: Currently state resets on full browser refresh. LocalStorage caching could be added if offline recovery is requested in future phases.
