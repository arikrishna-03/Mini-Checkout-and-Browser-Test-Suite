/**
 * Mini Checkout - Single Page Application
 * Pure Vanilla JavaScript with zero external runtime dependencies.
 * Integer-based money arithmetic to avoid floating-point inaccuracies.
 */

(function () {
  'use strict';

  // --- Product Catalog Configuration ---
  const PRODUCTS = {
    notebook: {
      id: 'notebook',
      name: 'Ruled notebook',
      price: 120 // in INR (₹)
    },
    pen: {
      id: 'pen',
      name: 'Gel pen pack',
      price: 80 // in INR (₹)
    }
  };

  const MIN_QTY = 1;
  const MAX_QTY = 99;

  // --- Application State ---
  let cart = {}; // Key: productId, Value: { qty: number }
  let isSubmitting = false;
  let isSubmitted = false;

  // --- DOM Elements ---
  const checkoutView = document.getElementById('checkout-view');
  const confirmationView = document.getElementById('confirmation-view');
  const cartTableWrapper = document.getElementById('cart-table-wrapper');
  const cartEmptyMessage = document.getElementById('cart-empty-message');
  const cartItemsBody = document.getElementById('cart-items-body');
  const orderTotalEl = document.getElementById('order-total');
  const customerNameInput = document.getElementById('customer-name');
  const cartErrorEl = document.getElementById('cart-error');
  const nameErrorEl = document.getElementById('name-error');
  const checkoutForm = document.getElementById('checkout-form');
  const placeOrderBtn = document.getElementById('btn-place-order');
  const orderReferenceEl = document.getElementById('order-reference');
  const confirmCustomerNameEl = document.getElementById('confirm-customer-name');
  const confirmTotalEl = document.getElementById('confirm-total');
  const newOrderBtn = document.getElementById('btn-new-order');

  // --- Money Formatting (Integer-safe) ---
  function formatMoney(amountInRupees) {
    // Strictly integer values
    return '₹' + Math.round(amountInRupees);
  }

  // --- State Calculations ---
  function calculateLineTotal(productId) {
    const item = cart[productId];
    if (!item) return 0;
    const product = PRODUCTS[productId];
    return Math.round(product.price * item.qty);
  }

  function calculateOrderTotal() {
    return Object.keys(cart).reduce((sum, productId) => {
      return sum + calculateLineTotal(productId);
    }, 0);
  }

  // --- Cart Management Functions ---
  function addToCart(productId) {
    if (!PRODUCTS[productId]) return;

    if (cart[productId]) {
      if (cart[productId].qty < MAX_QTY) {
        cart[productId].qty += 1;
      }
    } else {
      cart[productId] = { qty: 1 };
    }

    // Clear cart empty error if user adds an item
    if (cartErrorEl && !cartErrorEl.hidden) {
      cartErrorEl.hidden = true;
      cartErrorEl.textContent = '';
    }

    renderCart();
  }

  function updateQuantity(productId, newQty) {
    if (!cart[productId]) return;

    let parsed = parseInt(newQty, 10);
    if (isNaN(parsed) || parsed < MIN_QTY) {
      parsed = MIN_QTY;
    } else if (parsed > MAX_QTY) {
      parsed = MAX_QTY;
    }

    cart[productId].qty = parsed;
    renderCart();
  }

  function increaseQuantity(productId) {
    if (!cart[productId]) return;
    if (cart[productId].qty < MAX_QTY) {
      cart[productId].qty += 1;
      renderCart();
    }
  }

  function decreaseQuantity(productId) {
    if (!cart[productId]) return;
    if (cart[productId].qty > MIN_QTY) {
      cart[productId].qty -= 1;
      renderCart();
    }
  }

  function removeFromCart(productId) {
    if (!cart[productId]) return;
    delete cart[productId];
    renderCart();
  }

  // --- Rendering Functions ---
  function renderCart() {
    const productIds = Object.keys(cart);
    const hasItems = productIds.length > 0;

    if (!hasItems) {
      cartEmptyMessage.hidden = false;
      cartTableWrapper.hidden = true;
      cartItemsBody.innerHTML = '';
      orderTotalEl.textContent = formatMoney(0);
      return;
    }

    cartEmptyMessage.hidden = true;
    cartTableWrapper.hidden = false;
    cartItemsBody.innerHTML = '';

    productIds.forEach((productId) => {
      const product = PRODUCTS[productId];
      const item = cart[productId];
      const lineTotal = calculateLineTotal(productId);

      const row = document.createElement('tr');
      row.id = `cart-row-${productId}`;

      row.innerHTML = `
        <td class="td-product">
          <strong>${product.name}</strong>
        </td>
        <td class="td-price">${formatMoney(product.price)}</td>
        <td class="td-qty">
          <div class="qty-control" role="group" aria-label="Quantity for ${product.name}">
            <button
              type="button"
              class="btn btn-qty"
              data-testid="decrease-${productId}"
              id="btn-decrease-${productId}"
              aria-label="Decrease quantity of ${product.name}"
              ${item.qty <= MIN_QTY ? 'disabled' : ''}>-</button>
            <input
              type="number"
              class="qty-input"
              data-testid="qty-${productId}"
              id="input-qty-${productId}"
              value="${item.qty}"
              min="${MIN_QTY}"
              max="${MAX_QTY}"
              aria-label="Quantity of ${product.name}">
            <button
              type="button"
              class="btn btn-qty"
              data-testid="increase-${productId}"
              id="btn-increase-${productId}"
              aria-label="Increase quantity of ${product.name}"
              ${item.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
          </div>
        </td>
        <td class="td-total">
          <span data-testid="line-total-${productId}">${formatMoney(lineTotal)}</span>
        </td>
        <td class="td-action">
          <button
            type="button"
            class="btn-remove"
            data-testid="remove-${productId}"
            id="btn-remove-${productId}"
            aria-label="Remove ${product.name} from cart">Remove</button>
        </td>
      `;

      // Event listeners for quantity controls
      const decBtn = row.querySelector(`[data-testid="decrease-${productId}"]`);
      const incBtn = row.querySelector(`[data-testid="increase-${productId}"]`);
      const qtyInput = row.querySelector(`[data-testid="qty-${productId}"]`);
      const remBtn = row.querySelector(`[data-testid="remove-${productId}"]`);

      decBtn.addEventListener('click', () => decreaseQuantity(productId));
      incBtn.addEventListener('click', () => increaseQuantity(productId));

      qtyInput.addEventListener('change', (e) => {
        updateQuantity(productId, e.target.value);
      });

      qtyInput.addEventListener('blur', (e) => {
        updateQuantity(productId, e.target.value);
      });

      qtyInput.addEventListener('keydown', (e) => {
        // Prevent typing decimal point, minus sign, or 'e'
        if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) {
          e.preventDefault();
        }
      });

      remBtn.addEventListener('click', () => removeFromCart(productId));

      cartItemsBody.appendChild(row);
    });

    const total = calculateOrderTotal();
    orderTotalEl.textContent = formatMoney(total);
  }

  // --- Validation ---
  function validateOrder() {
    let isValid = true;
    const hasItems = Object.keys(cart).length > 0;
    const nameVal = customerNameInput.value.trim();

    // 1. Cart validation
    if (!hasItems) {
      cartErrorEl.textContent = 'Your cart is empty. Please add at least one item to proceed.';
      cartErrorEl.hidden = false;
      isValid = false;
    } else {
      cartErrorEl.textContent = '';
      cartErrorEl.hidden = true;
    }

    // 2. Customer Name validation (required, non-whitespace)
    if (!nameVal) {
      nameErrorEl.textContent = 'Please enter your name to complete checkout.';
      nameErrorEl.hidden = false;
      customerNameInput.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      nameErrorEl.textContent = '';
      nameErrorEl.hidden = true;
      customerNameInput.setAttribute('aria-invalid', 'false');
    }

    return isValid;
  }

  // Real-time error dismissal when user types in the name field
  customerNameInput.addEventListener('input', () => {
    if (customerNameInput.value.trim().length > 0) {
      nameErrorEl.textContent = '';
      nameErrorEl.hidden = true;
      customerNameInput.setAttribute('aria-invalid', 'false');
    }
  });

  // --- Order Reference Generator (ORD-XXXXXX) ---
  function generateOrderReference() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let refSuffix = '';
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      refSuffix += chars.charAt(idx);
    }
    return `ORD-${refSuffix}`;
  }

  // --- Place Order & Double-Submit Protection ---
  function handlePlaceOrder(e) {
    if (e) {
      e.preventDefault();
    }

    // Strict synchronous double-submit protection lock
    if (isSubmitting || isSubmitted) {
      return false;
    }

    const isValid = validateOrder();
    if (!isValid) {
      // Inputs and cart state are preserved intact
      return false;
    }

    // Lock state synchronously before any UI updates or timeouts
    isSubmitting = true;
    isSubmitted = true;
    placeOrderBtn.disabled = true;

    // Snapshot details
    const orderRef = generateOrderReference();
    const finalTotal = calculateOrderTotal();
    const customerName = customerNameInput.value.trim();

    // Populate confirmation
    orderReferenceEl.textContent = orderRef;
    confirmCustomerNameEl.textContent = customerName;
    confirmTotalEl.textContent = formatMoney(finalTotal);

    // Switch views
    checkoutView.hidden = true;
    confirmationView.hidden = false;

    // Shift focus to confirmation heading for accessibility
    const confirmHeading = document.getElementById('confirmation-heading');
    if (confirmHeading) {
      confirmHeading.setAttribute('tabindex', '-1');
      confirmHeading.focus();
    }

    return true;
  }

  // --- Reset Order State ---
  function handleNewOrder() {
    // Reset state variables
    cart = {};
    isSubmitting = false;
    isSubmitted = false;
    placeOrderBtn.disabled = false;

    // Reset form inputs & errors
    customerNameInput.value = '';
    customerNameInput.setAttribute('aria-invalid', 'false');
    nameErrorEl.textContent = '';
    nameErrorEl.hidden = true;
    cartErrorEl.textContent = '';
    cartErrorEl.hidden = true;

    // Switch views
    confirmationView.hidden = true;
    checkoutView.hidden = false;

    // Re-render empty cart
    renderCart();

    // Focus first interactive element in catalog
    const addNotebookBtn = document.getElementById('btn-add-notebook');
    if (addNotebookBtn) {
      addNotebookBtn.focus();
    }
  }

  // --- Event Bindings ---
  document.getElementById('btn-add-notebook').addEventListener('click', () => addToCart('notebook'));
  document.getElementById('btn-add-pen').addEventListener('click', () => addToCart('pen'));

  checkoutForm.addEventListener('submit', handlePlaceOrder);
  newOrderBtn.addEventListener('click', handleNewOrder);

  // Initialize
  renderCart();
})();
