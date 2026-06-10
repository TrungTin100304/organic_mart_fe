import test from "node:test";
import assert from "node:assert/strict";

import * as addressService from "../src/services/addressService.ts";
import * as adminUserService from "../src/services/adminUserService.ts";
import * as allergenService from "../src/services/allergenService.ts";
import * as authService from "../src/services/authService.ts";
import * as cartService from "../src/services/cartService.ts";
import * as categoryService from "../src/services/categoryService.ts";
import * as farmService from "../src/services/farmService.ts";
import * as inventoryBatchService from "../src/services/inventoryBatchService.ts";
import * as orderService from "../src/services/orderService.ts";
import * as paymentService from "../src/services/paymentService.ts";
import * as productService from "../src/services/productService.ts";
import * as shippingProviderService from "../src/services/shippingProviderService.ts";

const API_BASE_URL = "http://api.test/api/v1";

type CapturedCall = {
  url: string;
  init: RequestInit;
};

const authResponse = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  email: "user@test.dev",
  role: "ROLE_USER",
};

const userResponse = {
  id: 1,
  fullName: "Test User",
  email: "user@test.dev",
  phoneNumber: "0909000000",
  role: "ADMIN",
};

const addressResponse = {
  id: 2,
  label: "HOME" as const,
  recipientName: "Test User",
  recipientPhone: "0909000000",
  fullAddress: "123 Organic Street",
  isDefault: true,
};

const productResponse = {
  id: 3,
  name: "Organic Carrot",
  slug: "organic-carrot",
  price: 24000,
  unit: "500gr",
  isActive: true,
  category: {
    id: 4,
    name: "Vegetables",
    slug: "vegetables",
    parentId: null,
    sortOrder: 0,
  },
  allergens: [],
};

const productPageResponse = {
  content: [productResponse],
  totalElements: 1,
  totalPages: 1,
  size: 1,
  number: 0,
};

const cartResponse = {
  id: 5,
  userId: 1,
  totalQuantity: 1,
  totalPrice: 24000,
  distinctItemCount: 1,
  items: [],
};

const categoryResponse = {
  id: 6,
  name: "Vegetables",
  slug: "vegetables",
  parentId: null,
  sortOrder: 0,
};

const farmResponse = {
  id: 7,
  name: "Green Farm",
  certification: "Organic",
  location: "Da Nang",
};

const batchResponse = {
  id: 8,
  productId: 3,
  productName: "Organic Carrot",
  farmId: 7,
  farmName: "Green Farm",
  batchCode: "BATCH-001",
  quantityInitial: 100,
  quantityRemaining: 80,
  importDate: "2026-05-30",
  expiryDate: "2026-06-30",
  expired: false,
};

const traceabilityResponse = {
  productId: 3,
  productName: "Organic Carrot",
  productSlug: "organic-carrot",
  categoryName: "Vegetables",
  totalQuantityInitial: 100,
  totalQuantityRemaining: 80,
  batches: [batchResponse],
};

const shippingProviderResponse = {
  id: 9,
  name: "Organic Express",
  isActive: true,
};

const orderResponse = {
  id: 10,
  orderCode: "OM260606001",
  status: "PENDING",
  totalAmount: 44000,
};

const withMockApi = async <T>(call: () => Promise<T>, data: unknown) => {
  const calls: CapturedCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([
    ["accessToken", "access-token"],
    ["refreshToken", "refresh-token"],
  ]);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({ status: 200, message: "OK", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    const result = await call();
    assert.equal(calls.length, 1);
    return { request: calls[0], result };
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
};

const routeOf = (url: string) => {
  const parsed = new URL(url);
  return `${parsed.pathname.replace("/api/v1", "")}${parsed.search}`;
};

const jsonBody = (request: CapturedCall) => JSON.parse(String(request.init.body));

test("auth service wrappers call the expected auth endpoints", async () => {
  const cases: Array<{
    name: string;
    call: () => Promise<unknown>;
    expectedRoute: string;
    expectedMethod: string;
    expectedBody: unknown;
    response: unknown;
  }> = [
    {
      name: "signup",
      call: () => authService.signup({ fullName: "Test User", phoneNumber: "0909000000", email: "user@test.dev", password: "secret" }),
      expectedRoute: "/auth/signup",
      expectedMethod: "POST",
      expectedBody: { fullName: "Test User", phoneNumber: "0909000000", email: "user@test.dev", password: "secret" },
      response: authResponse,
    },
    {
      name: "login",
      call: () => authService.login({ email: "user@test.dev", password: "secret" }),
      expectedRoute: "/auth/login",
      expectedMethod: "POST",
      expectedBody: { email: "user@test.dev", password: "secret" },
      response: authResponse,
    },
    {
      name: "refresh",
      call: () => authService.refresh({ refreshToken: "refresh-token" }),
      expectedRoute: "/auth/refresh",
      expectedMethod: "POST",
      expectedBody: { refreshToken: "refresh-token" },
      response: authResponse,
    },
    {
      name: "logout",
      call: () => authService.logout({ refreshToken: "refresh-token" }),
      expectedRoute: "/auth/logout",
      expectedMethod: "POST",
      expectedBody: { refreshToken: "refresh-token" },
      response: "OK",
    },
    {
      name: "forgot password",
      call: () => authService.forgotPassword({ email: "user@test.dev" }),
      expectedRoute: "/auth/forgot-password",
      expectedMethod: "POST",
      expectedBody: { email: "user@test.dev" },
      response: "OK",
    },
    {
      name: "reset password",
      call: () => authService.resetPassword({ token: "reset-token", newPassword: "new-secret" }),
      expectedRoute: "/auth/reset-password",
      expectedMethod: "POST",
      expectedBody: { token: "reset-token", newPassword: "new-secret" },
      response: "OK",
    },
  ];

  for (const item of cases) {
    const { request } = await withMockApi(() => item.call(), item.response);
    assert.equal(routeOf(request.url), item.expectedRoute, item.name);
    assert.equal(request.init.method, item.expectedMethod, item.name);
    assert.deepEqual(jsonBody(request), item.expectedBody, item.name);
  }
});

test("storefront and account services call the expected backend endpoints", async () => {
  const updateUserForm = new FormData();
  updateUserForm.append("fullName", "Test User");
  updateUserForm.append("avatar", new File(["avatar"], "avatar.webp", { type: "image/webp" }));

  const cases: Array<{
    name: string;
    call: () => Promise<unknown>;
    expectedRoute: string;
    expectedMethod?: string;
    response: unknown;
    assertRequest?: (request: CapturedCall) => void;
  }> = [
    { name: "current user", call: () => adminUserService.getUserById(1), expectedRoute: "/users/1", response: userResponse },
    { name: "profile", call: () => import("../src/services/userService.ts").then((service) => service.getCurrentUser()), expectedRoute: "/users/me", response: userResponse },
    {
      name: "update profile",
      call: () => import("../src/services/userService.ts").then((service) => service.updateCurrentUser(updateUserForm)),
      expectedRoute: "/users/me",
      expectedMethod: "PUT",
      response: userResponse,
      assertRequest: (request) => {
        assert.equal((request.init.body as FormData).get("avatar") instanceof File, true);
        assert.equal(new Headers(request.init.headers).has("Content-Type"), false);
      },
    },
    { name: "addresses", call: () => addressService.getAllAddresses(), expectedRoute: "/user-addresses", response: [addressResponse] },
    { name: "address detail", call: () => addressService.getAddressById(2), expectedRoute: "/user-addresses/2", response: addressResponse },
    { name: "create address", call: () => addressService.createAddress(addressResponse), expectedRoute: "/user-addresses", expectedMethod: "POST", response: addressResponse },
    { name: "update address", call: () => addressService.updateAddress(2, addressResponse), expectedRoute: "/user-addresses/2", expectedMethod: "PUT", response: addressResponse },
    { name: "delete address", call: () => addressService.deleteAddress(2), expectedRoute: "/user-addresses/2", expectedMethod: "DELETE", response: null },
    { name: "cart", call: () => cartService.getCurrentCart(), expectedRoute: "/carts/me", response: cartResponse },
    { name: "add cart item", call: () => cartService.addCartItem(3, 2), expectedRoute: "/carts/items", expectedMethod: "POST", response: cartResponse },
    { name: "update cart item quantity", call: () => cartService.setCartItemQuantity(3, 2), expectedRoute: "/carts/items/3", expectedMethod: "PATCH", response: cartResponse },
    { name: "remove cart item", call: () => cartService.removeCartItem(3), expectedRoute: "/carts/items/3", expectedMethod: "DELETE", response: cartResponse },
    { name: "clear cart", call: () => cartService.clearCart(), expectedRoute: "/carts/me", expectedMethod: "DELETE", response: cartResponse },
    {
      name: "create order",
      call: () => orderService.createOrder({
        addressId: 2,
        deliveryMethod: "STANDARD",
        note: "Thanh toán COD",
        items: [{ productId: 3, quantity: 1 }],
      }),
      expectedRoute: "/orders",
      expectedMethod: "POST",
      response: orderResponse,
    },
    {
      name: "active shipping providers",
      call: () => shippingProviderService.getActiveShippingProviders(),
      expectedRoute: "/shipping-providers/active",
      response: [shippingProviderResponse],
    },
    { name: "create VietQR payment", call: () => paymentService.createVietQrPayment("2", "STANDARD"), expectedRoute: "/payments/vietqr", expectedMethod: "POST", response: { id: 1 } },
    { name: "get VietQR payment", call: () => paymentService.getVietQrPayment(1), expectedRoute: "/payments/vietqr/1", response: { id: 1 } },
    { name: "allergens", call: () => allergenService.getAllAllergens(), expectedRoute: "/allergens", response: [{ id: 1, name: "Peanut" }] },
    { name: "create allergen", call: () => allergenService.createAllergen("Peanut"), expectedRoute: "/allergens", expectedMethod: "POST", response: { id: 1, name: "Peanut" } },
    { name: "update allergen", call: () => allergenService.updateAllergen(1, "Sesame"), expectedRoute: "/allergens/1", expectedMethod: "PUT", response: { id: 1, name: "Sesame" } },
    { name: "delete allergen", call: () => allergenService.deleteAllergen(1), expectedRoute: "/allergens/1", expectedMethod: "DELETE", response: null },
  ];

  for (const item of cases) {
    const { request } = await withMockApi(() => item.call(), item.response);
    assert.equal(routeOf(request.url), item.expectedRoute, item.name);
    assert.equal(request.init.method ?? "GET", item.expectedMethod ?? "GET", item.name);
    item.assertRequest?.(request);
  }
});

test("catalog and admin services call the expected backend endpoints", async () => {
  const productValues = {
    name: "Organic Carrot",
    categoryId: 4,
    description: "Fresh",
    storageInstructions: "Keep chilled",
    detailedDescription: "Fresh organic carrot",
    price: 24000,
    unit: "500gr",
    isActive: true,
    allergenIds: [1],
    imageFile: new File(["product"], "product.jpg", { type: "image/jpeg" }),
  };

  const batchRequest = {
    productId: 3,
    farmId: 7,
    batchCode: "BATCH-001",
    quantityInitial: 100,
    quantityRemaining: 80,
    importDate: "2026-05-30",
    expiryDate: "2026-06-30",
    costPrice: 12000,
  };

  const cases: Array<{
    name: string;
    call: () => Promise<unknown>;
    expectedRoute: string;
    expectedMethod?: string;
    response: unknown;
    assertRequest?: (request: CapturedCall) => void;
  }> = [
    { name: "products page", call: () => productService.getProducts({ page: 2, size: 5 }), expectedRoute: "/products?page=2&size=5", response: productPageResponse },
    { name: "product detail", call: () => productService.getProductById(3), expectedRoute: "/products/3", response: productResponse },
    { name: "product traceability", call: () => productService.getProductTraceability(3), expectedRoute: "/products/3/traceability", response: traceabilityResponse },
    {
      name: "create product",
      call: () => productService.createProduct(productValues),
      expectedRoute: "/products",
      expectedMethod: "POST",
      response: productResponse,
      assertRequest: (request) => {
        const body = request.init.body as FormData;
        assert.equal(body.get("name"), "Organic Carrot");
        assert.equal(body.get("imageFile") instanceof File, true);
        assert.equal(new Headers(request.init.headers).has("Content-Type"), false);
      },
    },
    {
      name: "update product",
      call: () => productService.updateProduct(3, productValues),
      expectedRoute: "/products/3",
      expectedMethod: "PUT",
      response: productResponse,
      assertRequest: (request) => {
        const body = request.init.body as FormData;
        assert.equal(body.get("allergenIds"), "1");
        assert.equal(body.get("isActive"), "true");
        assert.equal(body.get("active"), null, "field 'active' must not be sent (backend reads isActive only)");
      },
    },
    { name: "delete product", call: () => productService.deleteProduct(3), expectedRoute: "/products/3", expectedMethod: "DELETE", response: null },
    { name: "product categories", call: () => categoryService.getProductCategories(), expectedRoute: "/product-categories", response: [categoryResponse] },
    { name: "create category", call: () => categoryService.createProductCategory({ name: "Vegetables" }), expectedRoute: "/product-categories", expectedMethod: "POST", response: categoryResponse },
    { name: "create category from product service", call: () => productService.createProductCategory("Vegetables"), expectedRoute: "/product-categories", expectedMethod: "POST", response: categoryResponse },
    { name: "farms", call: () => farmService.getFarms(), expectedRoute: "/farms", response: [farmResponse] },
    { name: "farm detail", call: () => farmService.getFarmById(7), expectedRoute: "/farms/7", response: farmResponse },
    { name: "create farm", call: () => farmService.createFarm(farmResponse), expectedRoute: "/farms", expectedMethod: "POST", response: farmResponse },
    { name: "update farm", call: () => farmService.updateFarm(7, farmResponse), expectedRoute: "/farms/7", expectedMethod: "PUT", response: farmResponse },
    { name: "delete farm", call: () => farmService.deleteFarm(7), expectedRoute: "/farms/7", expectedMethod: "DELETE", response: null },
    { name: "inventory batches", call: () => inventoryBatchService.getInventoryBatches(), expectedRoute: "/inventory-batches", response: [batchResponse] },
    { name: "inventory batch detail", call: () => inventoryBatchService.getInventoryBatchById(8), expectedRoute: "/inventory-batches/8", response: batchResponse },
    { name: "inventory batches by product", call: () => inventoryBatchService.getInventoryBatchesByProductId(3), expectedRoute: "/inventory-batches/product/3", response: [batchResponse] },
    { name: "inventory traceability", call: () => inventoryBatchService.getProductTraceability(3), expectedRoute: "/inventory-batches/product/3/traceability", response: traceabilityResponse },
    { name: "create inventory batch", call: () => inventoryBatchService.createInventoryBatch(batchRequest), expectedRoute: "/inventory-batches", expectedMethod: "POST", response: batchResponse },
    { name: "update inventory batch", call: () => inventoryBatchService.updateInventoryBatch(8, batchRequest), expectedRoute: "/inventory-batches/8", expectedMethod: "PUT", response: batchResponse },
    { name: "delete inventory batch", call: () => inventoryBatchService.deleteInventoryBatch(8), expectedRoute: "/inventory-batches/8", expectedMethod: "DELETE", response: null },
    { name: "users", call: () => adminUserService.getUsers(), expectedRoute: "/admin/users?page=0&size=20", response: [userResponse] },
    {
      name: "create user",
      call: () => adminUserService.createUser({
        fullName: "Test User",
        email: "user@test.dev",
        phoneNumber: "0909000000",
        password: "secret",
        role: "ROLE_USER",
      }),
      expectedRoute: "/admin/users",
      expectedMethod: "POST",
      response: userResponse,
      assertRequest: (request) => {
        const body = jsonBody(request);
        assert.equal(body.fullName, "Test User");
        assert.equal(body.email, "user@test.dev");
        assert.equal(body.phoneNumber, "0909000000");
        assert.equal(body.password, "secret");
        assert.equal(body.role, "ROLE_USER");
      },
    },
    {
      name: "update user",
      call: () => adminUserService.updateUser(1, { fullName: "Updated", phoneNumber: "0909000001" }),
      expectedRoute: "/users/1",
      expectedMethod: "PUT",
      response: userResponse,
      assertRequest: (request) => {
        const body = request.init.body as FormData;
        assert.equal(body.get("fullName"), "Updated");
        assert.equal(body.get("phoneNumber"), "0909000001");
      },
    },
    {
      name: "update user status",
      call: () => adminUserService.updateUserStatus(1, false),
      expectedRoute: "/users/1/status",
      expectedMethod: "PATCH",
      response: { ...userResponse, isActive: false },
      assertRequest: (request) => {
        assert.deepEqual(jsonBody(request), { isActive: false });
      },
    },
    { name: "delete user", call: () => adminUserService.deleteUser(1), expectedRoute: "/users/1", expectedMethod: "DELETE", response: null },
  ];

  for (const item of cases) {
    const { request } = await withMockApi(() => item.call(), item.response);
    assert.equal(routeOf(request.url), item.expectedRoute, item.name);
    assert.equal(request.init.method ?? "GET", item.expectedMethod ?? "GET", item.name);
    item.assertRequest?.(request);
  }
});

test("isAdminUser protects admin accounts across role string shapes", () => {
  assert.equal(adminUserService.isAdminUser({ role: "ROLE_ADMIN" }), true);
  assert.equal(adminUserService.isAdminUser({ role: "ADMIN" }), true);
  assert.equal(adminUserService.isAdminUser({ role: "admin" }), true);
  assert.equal(adminUserService.isAdminUser({ role: "ROLE_USER" }), false);
  assert.equal(adminUserService.isAdminUser({ role: null }), false);
  assert.equal(adminUserService.isAdminUser({ role: undefined }), false);
});

test("admin user list normalization does not overwrite the current session role", async () => {
  const calls: CapturedCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map<string, string>([
    ["accessToken", "access-token"],
    ["refreshToken", "refresh-token"],
    ["userRole", "ROLE_ADMIN"],
  ]);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return new Response(JSON.stringify({
      status: 200,
      message: "OK",
      data: [{
        id: 2,
        fullName: "Normal User",
        email: "normal@test.dev",
        phoneNumber: "0909000001",
        role: "ROLE_USER",
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  try {
    await adminUserService.getUsers();
    assert.equal(calls.length, 1);
    assert.equal(storage.get("userRole"), "ROLE_ADMIN");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", originalLocalStorage);
    } else {
      delete (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    }
  }
});

test("mock admin users exclude any admin role records", async () => {
  const { ADMIN_USERS } = await import("../src/admin/mocks/users.ts");
  assert.ok(ADMIN_USERS.length > 0, "mock should still contain non-admin users");
  for (const user of ADMIN_USERS) {
    assert.notEqual(user.role, "admin", `mock user ${user.email} must not be admin`);
  }
});
