const { test, expect } = require('@playwright/test');

test.describe('Mini Checkout Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Start every test from a clean, isolated state
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Campus Essentials' })).toBeVisible();
  });

  // ==========================================
  // REQUIRED THREE TESTS (@smoke)
  // ==========================================

  test('successful checkout shows a confirmation with a valid reference @smoke', async ({ page }) => {
    // 1. Add product to cart
    await page.getByTestId('add-notebook').click();
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');
    await expect(page.getByTestId('order-total')).toHaveText('₹120');

    // 2. Fill in required customer name
    await page.getByTestId('customer-name').fill('Ananya Sen');
    await expect(page.getByTestId('customer-name')).toHaveValue('Ananya Sen');

    // 3. Place order
    await page.getByTestId('place-order').click();

    // 4. Assert confirmation view is visible
    const confirmation = page.getByTestId('confirmation');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCount(1);

    // 5. Assert customer details and order total in confirmation
    await expect(page.getByTestId('confirm-customer-name')).toHaveText('Ananya Sen');
    await expect(page.getByTestId('confirm-total')).toHaveText('₹120');

    // 6. Assert order reference matches ORD-XXXXXX (6 alphanumeric uppercase chars)
    const refLocator = page.getByTestId('order-reference');
    await expect(refLocator).toBeVisible();
    await expect(refLocator).toHaveText(/^ORD-[0-9A-Z]{6}$/);

    // 7. Verify checkout form is hidden
    await expect(page.locator('#checkout-view')).toBeHidden();
  });

  test('missing name blocks checkout and shows a validation message @smoke', async ({ page }) => {
    // 1. Add product to cart so cart is valid
    await page.getByTestId('add-notebook').click();
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');

    // 2. Leave name empty and attempt checkout
    await page.getByTestId('place-order').click();

    // 3. Assert validation message is displayed to customer
    const nameError = page.getByTestId('name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveText('Please enter your name to complete checkout.');

    // 4. Assert accessible invalid attribute on input
    await expect(page.getByTestId('customer-name')).toHaveAttribute('aria-invalid', 'true');

    // 5. Assert checkout is blocked (confirmation remains hidden)
    await expect(page.getByTestId('confirmation')).toBeHidden();

    // 6. Assert cart state was not wiped out
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');
    await expect(page.getByTestId('order-total')).toHaveText('₹120');
  });

  test('changing quantity updates line total and order total to the exact amount @smoke', async ({ page }) => {
    // 1. Add notebook (₹120) and pen (₹80)
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('add-pen').click();

    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');
    await expect(page.getByTestId('line-total-pen')).toHaveText('₹80');
    await expect(page.getByTestId('order-total')).toHaveText('₹200');

    // 2. Increase notebook quantity via increment button (+) -> 2 notebooks = ₹240
    await page.getByTestId('increase-notebook').click();
    await expect(page.getByTestId('qty-notebook')).toHaveValue('2');
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹240');
    await expect(page.getByTestId('order-total')).toHaveText('₹320');

    // 3. Update pen quantity directly via input field -> 3 pens = ₹240
    const penQtyInput = page.getByTestId('qty-pen');
    await penQtyInput.fill('3');
    await penQtyInput.dispatchEvent('change');

    await expect(penQtyInput).toHaveValue('3');
    await expect(page.getByTestId('line-total-pen')).toHaveText('₹240');
    await expect(page.getByTestId('order-total')).toHaveText('₹480'); // 240 + 240 = 480

    // 4. Decrease notebook quantity (-) -> 1 notebook = ₹120
    await page.getByTestId('decrease-notebook').click();
    await expect(page.getByTestId('qty-notebook')).toHaveValue('1');
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');
    await expect(page.getByTestId('order-total')).toHaveText('₹360'); // 120 + 240 = 360
  });

  // ==========================================
  // EXTENDED REGRESSION SUITE (@regression)
  // ==========================================

  test('empty cart blocks checkout and displays validation error @regression', async ({ page }) => {
    // Fill name but keep cart empty
    await page.getByTestId('customer-name').fill('Rohan Roy');
    await page.getByTestId('place-order').click();

    // Assert cart error message is displayed
    const cartError = page.getByTestId('cart-error');
    await expect(cartError).toBeVisible();
    await expect(cartError).toHaveText('Your cart is empty. Please add at least one item to proceed.');

    // Assert checkout is blocked
    await expect(page.getByTestId('confirmation')).toBeHidden();

    // Assert customer name is preserved
    await expect(page.getByTestId('customer-name')).toHaveValue('Rohan Roy');
  });

  test('whitespace-only name blocks checkout and shows validation message @regression', async ({ page }) => {
    // Add product
    await page.getByTestId('add-notebook').click();

    // Fill only spaces into name field
    await page.getByTestId('customer-name').fill('     ');
    await page.getByTestId('place-order').click();

    // Assert validation error
    const nameError = page.getByTestId('name-error');
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveText('Please enter your name to complete checkout.');
    await expect(page.getByTestId('customer-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('confirmation')).toBeHidden();
  });

  test('both empty cart and missing name errors display simultaneously @regression', async ({ page }) => {
    // Attempt checkout with both cart empty and name missing
    await page.getByTestId('place-order').click();

    // Both error banners must be visible
    await expect(page.getByTestId('cart-error')).toBeVisible();
    await expect(page.getByTestId('name-error')).toBeVisible();
    await expect(page.getByTestId('customer-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('confirmation')).toBeHidden();
  });

  test('customer name is preserved after failed checkout attempt @regression', async ({ page }) => {
    // Type name with empty cart
    await page.getByTestId('customer-name').fill('Meera Nair');
    await page.getByTestId('place-order').click();

    // Validation blocked
    await expect(page.getByTestId('cart-error')).toBeVisible();

    // Name value is preserved intact
    await expect(page.getByTestId('customer-name')).toHaveValue('Meera Nair');
  });

  test('cart items and quantities are preserved after failed checkout attempt @regression', async ({ page }) => {
    // Add items and change quantity
    await page.getByTestId('add-pen').click();
    await page.getByTestId('increase-pen').click();
    await expect(page.getByTestId('qty-pen')).toHaveValue('2');
    await expect(page.getByTestId('order-total')).toHaveText('₹160');

    // Attempt checkout without name
    await page.getByTestId('place-order').click();

    // Validation error shown
    await expect(page.getByTestId('name-error')).toBeVisible();

    // Cart items and line total remain intact
    await expect(page.getByTestId('qty-pen')).toHaveValue('2');
    await expect(page.getByTestId('line-total-pen')).toHaveText('₹160');
    await expect(page.getByTestId('order-total')).toHaveText('₹160');
  });

  test('rapid double-click on place order produces exactly one confirmation and reference @regression', async ({ page }) => {
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('customer-name').fill('Vikram Malhotra');

    const placeOrderBtn = page.getByTestId('place-order');

    // Trigger rapid double-click
    await placeOrderBtn.dblclick();

    // Exactly one confirmation rendered
    const confirmation = page.getByTestId('confirmation');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCount(1);

    // Exactly one reference element
    const refLocator = page.getByTestId('order-reference');
    await expect(refLocator).toHaveCount(1);
    await expect(refLocator).toHaveText(/^ORD-[0-9A-Z]{6}$/);

    // Reference remains completely stable
    const refText1 = await refLocator.textContent();
    // Attempt clicking again on button if visible or ensure disabled
    await expect(placeOrderBtn).toBeDisabled();
    const refText2 = await refLocator.textContent();
    expect(refText1).toBe(refText2);
  });

  test('rapid 5x burst clicks on place order produce exactly one confirmation @regression', async ({ page }) => {
    await page.getByTestId('add-pen').click();
    await page.getByTestId('customer-name').fill('Neha Verma');

    const placeOrderBtn = page.getByTestId('place-order');

    // Fire 5 clicks in rapid burst on the button
    await placeOrderBtn.evaluate((btn) => {
      for (let i = 0; i < 5; i++) {
        btn.click();
      }
    });

    // Exactly one confirmation card rendered
    const confirmation = page.getByTestId('confirmation');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toHaveCount(1);

    const refLocator = page.getByTestId('order-reference');
    await expect(refLocator).toHaveCount(1);
    await expect(refLocator).toHaveText(/^ORD-[0-9A-Z]{6}$/);
    await expect(page.getByTestId('confirm-total')).toHaveText('₹80');
  });

  test('removing an item from cart updates the total and cart display @regression', async ({ page }) => {
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('add-pen').click();
    await expect(page.getByTestId('order-total')).toHaveText('₹200');

    // Remove notebook
    await page.getByTestId('remove-notebook').click();

    // Notebook row is gone, pen remains
    await expect(page.getByTestId('line-total-notebook')).toHaveCount(0);
    await expect(page.getByTestId('line-total-pen')).toHaveText('₹80');
    await expect(page.getByTestId('order-total')).toHaveText('₹80');

    // Remove pen
    await page.getByTestId('remove-pen').click();

    // Cart is now empty
    await expect(page.getByTestId('line-total-pen')).toHaveCount(0);
    await expect(page.getByTestId('order-total')).toHaveText('₹0');
    await expect(page.locator('#cart-empty-message')).toBeVisible();
  });

  test('quantity boundaries and invalid inputs clamp correctly between 1 and 99 @regression', async ({ page }) => {
    await page.getByTestId('add-notebook').click();
    const qtyInput = page.getByTestId('qty-notebook');
    const decBtn = page.getByTestId('decrease-notebook');

    // At qty = 1, decrease button is disabled
    await expect(decBtn).toBeDisabled();

    // Type 0 -> clamps back to 1 on change
    await qtyInput.fill('0');
    await qtyInput.dispatchEvent('change');
    await expect(qtyInput).toHaveValue('1');
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');

    // Type negative -> clamps back to 1
    await qtyInput.fill('-5');
    await qtyInput.dispatchEvent('change');
    await expect(qtyInput).toHaveValue('1');

    // Type number > 99 (e.g. 150) -> clamps to 99
    await qtyInput.fill('150');
    await qtyInput.dispatchEvent('change');
    await expect(qtyInput).toHaveValue('99');
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹11880'); // 99 * 120 = 11880

    // At qty = 99, increase button is disabled
    const incBtn = page.getByTestId('increase-notebook');
    await expect(incBtn).toBeDisabled();
  });

  test('starting a new order resets cart, customer name, and submission lock @regression', async ({ page }) => {
    // 1. Complete an order
    await page.getByTestId('add-notebook').click();
    await page.getByTestId('customer-name').fill('Kavita Krishnan');
    await page.getByTestId('place-order').click();

    await expect(page.getByTestId('confirmation')).toBeVisible();
    const firstRef = await page.getByTestId('order-reference').textContent();

    // 2. Click "Start a new order"
    await page.getByTestId('new-order').click();

    // 3. Verify confirmation hidden and checkout view restored
    await expect(page.getByTestId('confirmation')).toBeHidden();
    await expect(page.locator('#checkout-view')).toBeVisible();

    // 4. Verify fields and cart are fully reset
    await expect(page.getByTestId('customer-name')).toHaveValue('');
    await expect(page.getByTestId('order-total')).toHaveText('₹0');
    await expect(page.locator('#cart-empty-message')).toBeVisible();

    // 5. Complete a second fresh order
    await page.getByTestId('add-pen').click();
    await page.getByTestId('customer-name').fill('Dev Patel');
    await page.getByTestId('place-order').click();

    await expect(page.getByTestId('confirmation')).toBeVisible();
    await expect(page.getByTestId('confirm-customer-name')).toHaveText('Dev Patel');
    await expect(page.getByTestId('confirm-total')).toHaveText('₹80');

    // Order reference must be fresh
    const secondRef = await page.getByTestId('order-reference').textContent();
    expect(secondRef).toMatch(/^ORD-[0-9A-Z]{6}$/);
    expect(secondRef).not.toBe(firstRef);
  });

  test('keyboard-only checkout navigation using Tab and Enter @regression', async ({ page }) => {
    // Focus first catalog button
    const addNotebookBtn = page.getByTestId('add-notebook');
    await addNotebookBtn.focus();
    await page.keyboard.press('Enter');

    // Notebook added to cart
    await expect(page.getByTestId('line-total-notebook')).toHaveText('₹120');

    // Focus customer name input
    const nameInput = page.getByTestId('customer-name');
    await nameInput.focus();
    await page.keyboard.type('Arjun Raman');
    await expect(nameInput).toHaveValue('Arjun Raman');

    // Tab to Place Order button
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('place-order')).toBeFocused();

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Order successfully placed
    await expect(page.getByTestId('confirmation')).toBeVisible();
    await expect(page.getByTestId('confirm-customer-name')).toHaveText('Arjun Raman');
    await expect(page.getByTestId('confirm-total')).toHaveText('₹120');
  });
});
