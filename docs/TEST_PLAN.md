# Mini Checkout Test Plan & Strategy

## 1. Overview & Objective
This test plan defines the verification strategy for the **Mini Checkout** single-page web application. The application provides an accessible, reliable customer checkout journey with synthetic products, real-time quantity and total recalculations, form validation, and robust double-submit protection.

The primary objective is to prove functional correctness, mathematical accuracy, robust error handling, synchronous double-submission prevention, and full accessibility compliance without reliance on flaky waits or artificial timeouts.

---

## 2. Scope & Boundaries

### 2.1 In Scope
- **Product Catalog Interaction**: Adding items ("Ruled notebook" at ₹120, "Gel pen pack" at ₹80).
- **Cart Management**: Real-time line item quantity updates (1–99), item removal, and reactive line/order total recalculation.
- **Form Validation & State Preservation**:
  - Empty cart validation.
  - Required customer name validation (blocking empty or whitespace-only names).
  - Simultaneous multi-error presentation.
  - Non-destructive validation (customer inputs and cart items preserved on failure).
- **Double-Submit Protection**:
  - Synchronous locking on submission preventing duplicate orders, double reference generation, or concurrent network/state anomalies.
- **Order Confirmation & Reset**:
  - Display of order reference (`ORD-XXXXXX`), customer name, and exact order total.
  - Full application state reset via "Start a new order".
- **Accessibility (a11y) & Usability**:
  - Semantic HTML structure (`main`, `section`, `table`, `form`).
  - Accessible names and form associations (`label[for]`, `aria-required`, `aria-invalid`, `aria-describedby`, `role="alert"`).
  - Full keyboard-only operability (Tab, Enter, Space).
  - Responsive layout down to mobile viewports.

### 2.2 Out of Scope
- Backend server processing, database persistence, payment gateways, authentication, and external network APIs (intentionally zero-backend per hackathon brief).

---

## 3. Risk-Based Prioritization Matrix

| Risk ID | Risk Description | Likelihood | Impact | Severity / Priority | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Duplicate orders placed due to double-clicking or rapid clicking "Place Order". | High | Critical | **P0 (Critical)** | Synchronous client-side submission lock + immediate button disablement; test with rapid double-click and 5x burst clicks. |
| **RSK-02** | Floating-point rounding errors causing discrepancies between line totals and order total. | Medium | High | **P0 (Critical)** | Pure integer arithmetic (INR whole units); explicit test cases asserting exact line totals and order sums. |
| **RSK-03** | Order placed with empty cart or blank/whitespace customer name. | High | High | **P0 (Critical)** | Pre-submission schema validation; independent alerts for empty cart and missing name; tests verifying checkout block. |
| **RSK-04** | Accidental data loss: validation errors clearing customer name or cart contents. | Medium | Medium | **P1 (High)** | Non-destructive validation lifecycle; dedicated regression tests asserting customer name and cart preservation. |
| **RSK-05** | UI overlay overlap: checkout form remaining visible when confirmation appears (CSS grid specificity). | High | High | **P1 (High)** | Global `[hidden] { display: none !important; }` rule; test asserting checkout-view visibility is hidden upon confirmation. |
| **RSK-06** | Invalid quantity input (0, negative, decimal, non-numeric, >99) corrupting totals. | Medium | Medium | **P1 (High)** | Strict input sanitization clamping values between 1 and 99; keyboard prevention for invalid characters. |
| **RSK-07** | State retention bug: "Start a new order" retaining previous customer data or order lock. | Medium | Medium | **P1 (High)** | Comprehensive reset routine clearing state, re-enabling buttons, resetting total to ₹0; regression verification. |
| **RSK-08** | Inaccessible form preventing keyboard-only or screen reader users from completing checkout. | Medium | Medium | **P2 (Medium)** | Semantic markup, visible focus indicators (`:focus-visible`), aria labels, keyboard navigation regression test. |

---

## 4. Test Case Specifications

| Test Case ID | Title & Description | Preconditions | Steps | Expected Result | Priority | Execution Mode |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SMK-01** | Successful checkout shows confirmation with valid reference | App loaded at clean state (`/`) | 1. Add "Ruled notebook" to cart.<br>2. Fill name "Ananya Sen".<br>3. Click "Place Order". | 1. Confirmation view is displayed.<br>2. Checkout view is hidden.<br>3. Customer name is "Ananya Sen".<br>4. Total is ₹120.<br>5. Order reference matches `^ORD-[0-9A-Z]{6}$`. | **P0** | Automated (@smoke) |
| **TC-SMK-02** | Missing name blocks checkout and shows validation message | App loaded at clean state (`/`) | 1. Add "Ruled notebook" to cart.<br>2. Leave customer name blank.<br>3. Click "Place Order". | 1. Validation error displayed at `name-error`.<br>2. `aria-invalid="true"` set on name input.<br>3. Confirmation view remains hidden.<br>4. Cart items and total remain intact. | **P0** | Automated (@smoke) |
| **TC-SMK-03** | Changing quantity updates line total and order total to exact amount | App loaded at clean state (`/`) | 1. Add notebook (₹120) and pen (₹80).<br>2. Click `+` on notebook.<br>3. Type `3` into pen quantity.<br>4. Click `-` on notebook. | 1. Initial total is ₹200.<br>2. Notebook line total is ₹240, order total ₹320.<br>3. Pen line total is ₹240, order total ₹480.<br>4. Notebook line total is ₹120, order total ₹360. | **P0** | Automated (@smoke) |
| **TC-REG-01** | Empty cart blocks checkout and displays validation error | App loaded at clean state (`/`) | 1. Enter customer name "Rohan Roy".<br>2. Cart is empty.<br>3. Click "Place Order". | 1. `cart-error` alert is displayed.<br>2. Confirmation remains hidden.<br>3. Customer name "Rohan Roy" is preserved. | **P0** | Automated (@regression) |
| **TC-REG-02** | Whitespace-only name blocks checkout | App loaded at clean state (`/`) | 1. Add notebook.<br>2. Enter spaces `"     "` in name.<br>3. Click "Place Order". | 1. `name-error` alert is displayed.<br>2. `aria-invalid="true"` set on input.<br>3. Confirmation remains hidden. | **P0** | Automated (@regression) |
| **TC-REG-03** | Simultaneous empty cart and missing name display both errors | App loaded at clean state (`/`) | 1. Leave cart empty.<br>2. Leave name empty.<br>3. Click "Place Order". | 1. Both `cart-error` and `name-error` alerts are displayed simultaneously.<br>2. Confirmation remains hidden. | **P1** | Automated (@regression) |
| **TC-REG-04** | Customer name preserved after failed checkout | App loaded at clean state (`/`) | 1. Enter name "Meera Nair".<br>2. Click "Place Order" (empty cart). | 1. `cart-error` shown.<br>2. Value in `customer-name` remains "Meera Nair". | **P1** | Automated (@regression) |
| **TC-REG-05** | Cart items and quantities preserved after failed checkout | App loaded at clean state (`/`) | 1. Add pen, increase to qty 2.<br>2. Click "Place Order" (no name). | 1. `name-error` shown.<br>2. Pen qty remains 2, line total ₹160, order total ₹160. | **P1** | Automated (@regression) |
| **TC-REG-06** | Rapid double-click produces exactly ONE confirmation and reference | App loaded at clean state (`/`) | 1. Add notebook.<br>2. Fill customer name.<br>3. Execute rapid double-click on "Place Order". | 1. Exactly one confirmation card rendered (`toHaveCount(1)`).<br>2. Exactly one reference created.<br>3. Reference is stable.<br>4. Place Order button disabled. | **P0** | Automated (@regression) & Manual |
| **TC-REG-07** | Rapid 5x burst clicks produce exactly one confirmation | App loaded at clean state (`/`) | 1. Add pen.<br>2. Fill customer name.<br>3. Fire 5 concurrent click events on "Place Order". | 1. Exactly one confirmation card rendered.<br>2. Exactly one reference created.<br>3. Total is ₹80. | **P0** | Automated (@regression) & Manual |
| **TC-REG-08** | Removing an item updates cart and order total | App loaded at clean state (`/`) | 1. Add notebook and pen (₹200).<br>2. Click "Remove" on notebook.<br>3. Click "Remove" on pen. | 1. After step 2: notebook row removed, total ₹80.<br>2. After step 3: pen row removed, total ₹0, empty cart banner shown. | **P1** | Automated (@regression) |
| **TC-REG-09** | Quantity boundaries and invalid inputs clamp correctly (1–99) | App loaded at clean state (`/`) | 1. Add notebook.<br>2. Verify decrease disabled at qty 1.<br>3. Type `0` -> change.<br>4. Type `-5` -> change.<br>5. Type `150` -> change. | 1. Decrease button disabled at 1.<br>2. `0` clamps to 1.<br>3. `-5` clamps to 1.<br>4. `150` clamps to 99, line total ₹11,880, increase button disabled. | **P1** | Automated (@regression) |
| **TC-REG-10** | "Start a new order" resets cart, customer name, and submission lock | Order completed at confirmation | 1. Click "Start a new order".<br>2. Verify view reset.<br>3. Place a second fresh order. | 1. Confirmation hidden, checkout visible.<br>2. Name is `""`, total is `₹0`, cart is empty.<br>3. New order completes with a distinct, fresh order reference. | **P1** | Automated (@regression) |
| **TC-REG-11** | Keyboard-only checkout navigation using Tab and Enter | App loaded at clean state (`/`) | 1. Focus "Add to Cart" via Tab/Enter.<br>2. Tab to customer name, type name.<br>3. Tab to "Place Order", press Enter. | 1. Item added without mouse.<br>2. Name entered.<br>3. Order placed successfully and confirmation view displayed. | **P2** | Automated (@regression) |

---

## 5. Traceability Matrix

| Risk ID | Covered By Test Case ID(s) | Automated Playwright Test Name |
| :--- | :--- | :--- |
| **RSK-01** (Double-submit) | TC-REG-06, TC-REG-07 | `rapid double-click on place order produces exactly one confirmation and reference @regression`<br>`rapid 5x burst clicks on place order produce exactly one confirmation @regression` |
| **RSK-02** (Integer math) | TC-SMK-01, TC-SMK-03, TC-REG-08, TC-REG-09 | `successful checkout shows a confirmation with a valid reference @smoke`<br>`changing quantity updates line total and order total to the exact amount @smoke`<br>`removing an item from cart updates the total and cart display @regression`<br>`quantity boundaries and invalid inputs clamp correctly between 1 and 99 @regression` |
| **RSK-03** (Validation block) | TC-SMK-02, TC-REG-01, TC-REG-02, TC-REG-03 | `missing name blocks checkout and shows a validation message @smoke`<br>`empty cart blocks checkout and displays validation error @regression`<br>`whitespace-only name blocks checkout and shows validation message @regression`<br>`both empty cart and missing name errors display simultaneously @regression` |
| **RSK-04** (Data preservation) | TC-REG-04, TC-REG-05 | `customer name is preserved after failed checkout attempt @regression`<br>`cart items and quantities are preserved after failed checkout attempt @regression` |
| **RSK-05** (UI overlay specificity) | TC-SMK-01, TC-REG-10 | `successful checkout shows a confirmation with a valid reference @smoke`<br>`starting a new order resets cart, customer name, and submission lock @regression` |
| **RSK-06** (Quantity boundaries) | TC-REG-09 | `quantity boundaries and invalid inputs clamp correctly between 1 and 99 @regression` |
| **RSK-07** (State reset) | TC-REG-10 | `starting a new order resets cart, customer name, and submission lock @regression` |
| **RSK-08** (Accessibility & Keyboard) | TC-SMK-02, TC-REG-11 | `missing name blocks checkout and shows a validation message @smoke`<br>`keyboard-only checkout navigation using Tab and Enter @regression` |

---

## 6. Execution Criteria & Environment

### 6.1 Entry Criteria
- Clean installation of npm dependencies (`@playwright/test`).
- Application server running and reachable at `http://127.0.0.1:3000/`.
- Browser binaries installed (`npx playwright install chromium`).

### 6.2 Exit Criteria
- 100% pass rate on all automated tests (14/14 tests passing).
- Zero flaky failures across 3 consecutive complete suite executions.
- Zero duplicate confirmations under double-click and 5x burst load across 5 repeated runs.
- All manual exploratory scenarios executed with high-resolution screenshot evidence captured.
- Mutation check performed confirming that intentional app mutations trigger expected test failures.

### 6.3 Test Environment
- **Operating System**: Windows 11 (build x64)
- **Node.js Runtime**: v24.11.0
- **Package Manager**: npm 11.6.1
- **Test Automation Framework**: Playwright v1.49.0
- **Target Browser Engine**: Chromium 159.0.8154.6
