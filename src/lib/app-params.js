const isNode = typeof window === 'undefined';
const storage = isNode ? null : window.localStorage;

const toSnakeCase = (str) => str.replace(/([A-Z])/g, '_$1').toLowerCase();

const envDefaults = {
  app_id: process.env.NEXT_PUBLIC_BASE44_APP_ID,
  functions_version: process.env.NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION,
  app_base_url: process.env.NEXT_PUBLIC_BASE44_APP_BASE_URL,
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) return defaultValue;
  const storageKey = `base44_${toSnakeCase(paramName)}`;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const next = `${window.location.pathname}${urlParams.toString() ? `?${urlParams}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, next);
  }
  if (searchParam) {
    storage?.setItem(storageKey, searchParam);
    return searchParam;
  }
  if (defaultValue) {
    storage?.setItem(storageKey, defaultValue);
    return defaultValue;
  }
  return storage?.getItem(storageKey) || null;
};

export const appParams = {
  appId: getAppParamValue('app_id', { defaultValue: envDefaults.app_id }),
  token: getAppParamValue('access_token', { removeFromUrl: true }),
  fromUrl: isNode ? '/' : window.location.href,
  functionsVersion: getAppParamValue('functions_version', { defaultValue: envDefaults.functions_version }),
  appBaseUrl: getAppParamValue('app_base_url', { defaultValue: envDefaults.app_base_url }),
};
