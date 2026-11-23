/**
 * Evidence Collection Script
 * Executes the required manual test scenarios against the local server
 * and captures reproducible screenshot evidence saved to the /evidence directory.
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runEvidenceCapture() {
  const evidenceDir = path.join(__dirname, '..', 'evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2 // High DPI screenshot
  });

  console.log('Starting manual test evidence capture...');

  // --- Scenario 1: Empty cart + Place order ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('customer-name').fill('Rajesh Kumar');
    await page.getByTestId('place-order').click();
    await page.waitForSelector('[data-testid="cart-error"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '01-empty-cart-validation.png'),
      fullPage: true
    });
    console.log('Saved: 01-empty-cart-validation.png');
    await page.close();
  }

  // --- Scenario 2: Missing required name ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('place-order').click();
    await page.waitForSelector('[data-testid="name-error"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '02-missing-name-validation.png'),
      fullPage: true
    });
    console.log('Saved: 02-missing-name-validation.png');
    await page.close();
  }

  // --- Scenario 3: Simultaneous empty cart and missing name ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('place-order').click();
    await page.waitForSelector('[data-testid="cart-error"]:not([hidden])');
    await page.waitForSelector('[data-testid="name-error"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '03-combined-validation-errors.png'),
      fullPage: true
    });
    console.log('Saved: 03-combined-validation-errors.png');
    await page.close();
  }

  // --- Scenario 4: Quantity change & exact total update ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('add-pen').click();
    await page.getByTestId('increase-notebook').click(); // 2 notebooks = 240
    const penQtyInput = page.getByTestId('qty-pen');
    await penQtyInput.fill('3'); // 3 pens = 240
    await penQtyInput.dispatchEvent('change');
    await page.screenshot({
      path: path.join(evidenceDir, '04-quantity-update.png'),
      fullPage: true
    });
    console.log('Saved: 04-quantity-update.png');
    await page.close();
  }

  // --- Scenario 5: Successful checkout and order confirmation ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('customer-name').fill('Ananya Sen');
    await page.getByTestId('place-order').click();
    await page.waitForSelector('[data-testid="confirmation"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '05-successful-checkout.png'),
      fullPage: true
    });
    console.log('Saved: 05-successful-checkout.png');
    await page.close();
  }

  // --- Scenario 6: Rapid double-click on Place order ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('customer-name').fill('Vikram Malhotra');
    const placeBtn = page.getByTestId('place-order');
    await placeBtn.dblclick();
    await page.waitForSelector('[data-testid="confirmation"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '06-double-click-prevention.png'),
      fullPage: true
    });
    console.log('Saved: 06-double-click-prevention.png');
    await page.close();
  }

  // --- Scenario 7: 5x Rapid-click burst ---
  {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000');
    await page.getByTestId('add-pen').click();
    await page.getByTestId('customer-name').fill('Neha Verma');
    const placeBtn = page.getByTestId('place-order');
    await placeBtn.evaluate((btn) => {
      for (let i = 0; i < 5; i++) {
        btn.click();
      }
    });
    await page.waitForSelector('[data-testid="confirmation"]:not([hidden])');
    await page.screenshot({
      path: path.join(evidenceDir, '07-5x-click-burst.png'),
      fullPage: true
    });
    console.log('Saved: 07-5x-click-burst.png');
    await page.close();
  }

  await browser.close();
  console.log('All manual test evidence captured successfully.');
}

runEvidenceCapture().catch((err) => {
  console.error('Error during evidence capture:', err);
  process.exit(1);
});
