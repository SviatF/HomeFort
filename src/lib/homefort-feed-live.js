import 'server-only';

// Live Homefort product ingestion is intentionally disabled.
// The catalog routes/components remain intact, but no legacy products are
// fetched, restored from fallbacks, or exposed to the application.
export async function getHomefortLiveProducts() {
  return [];
}

export async function getHomefortLiveProductBySlug() {
  return null;
}

export async function getHomefortLiveCategoryKeys() {
  return [];
}
