const test = require('node:test');
const assert = require('node:assert/strict');

const inventory = require('../lib/inventory');
const orders = require('../lib/orders');

test('checkout accepts the final sellable unit when all stock is available', () => {
  const products = [{ id: 6, name: 'A2 Gir Cow Ghee 500ml', stock: 1, reserved: 0 }];

  assert.deepEqual(inventory.check(products, [{ id: 6, qty: 1 }]), { ok: true });
});

test('checkout accepts the final unreserved unit when other units are reserved', () => {
  const products = [{ id: 11, name: 'Byadgi Chilli Powder', stock: 4, reserved: 3 }];

  assert.deepEqual(inventory.check(products, [{ id: 11, qty: 1 }]), { ok: true });
});

test('cancelling a pending order restores its items to physical stock', () => {
  const db = {
    products: [{ id: 6, stock: 1, reserved: 0 }],
    orders: [{ id: 1007, status: 'pending', paymentMode: 'cash', items: [{ id: 6, qty: 2 }] }],
    customers: []
  };

  const result = orders.cancel(db, 1007, 'Customer cancelled');

  assert.equal(result.ok, true);
  assert.equal(result.order.status, 'cancelled');
  assert.equal(db.products[0].stock, 3);
});

test('cancelling an order twice does not restore its stock twice', () => {
  const db = {
    products: [{ id: 6, stock: 1, reserved: 0 }],
    orders: [{ id: 1007, status: 'pending', paymentMode: 'cash', items: [{ id: 6, qty: 2 }] }],
    customers: []
  };

  orders.cancel(db, 1007, 'Customer cancelled');
  const result = orders.cancel(db, 1007, 'Repeated cancellation');

  assert.equal(result.ok, false);
  assert.equal(db.products[0].stock, 3);
});
