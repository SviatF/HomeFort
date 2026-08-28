import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const config = { appId: appParams.appId };
if (appParams.token) config.token = appParams.token;

const sdkClient = createClient(config);

// Legacy product inventory is intentionally disabled while the DOMERA catalog
// is being rebuilt. Other Base44 entities continue to work normally.
const EMPTY_ARRAY_PRODUCT_READS = new Set(['filter', 'list', 'search']);
const EMPTY_SINGLE_PRODUCT_READS = new Set(['get', 'getById']);

const productEntity = new Proxy(sdkClient.entities?.Product || {}, {
  get(target, prop, receiver) {
    if (EMPTY_ARRAY_PRODUCT_READS.has(prop)) return async () => [];
    if (EMPTY_SINGLE_PRODUCT_READS.has(prop)) return async () => null;

    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

const entities = new Proxy(sdkClient.entities || {}, {
  get(target, prop, receiver) {
    if (prop === 'Product') return productEntity;
    return Reflect.get(target, prop, receiver);
  },
});

export const base44 = new Proxy(sdkClient, {
  get(target, prop, receiver) {
    if (prop === 'entities') return entities;
    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});
