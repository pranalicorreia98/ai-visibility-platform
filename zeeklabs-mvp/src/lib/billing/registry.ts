import type { PaymentProvider, ProductKey } from "./types";
import { dodoProvider } from "./providers/dodo";

/**
 * Per-product provider choice. Today ZeekLabs runs on Dodo; a second provider
 * (or ClikHire reuse) is a new adapter + one line here — nothing else changes.
 */
const PROVIDERS: Record<ProductKey, PaymentProvider> = {
  zeeklabs: dodoProvider,
};

export function providerFor(product: ProductKey): PaymentProvider {
  const provider = PROVIDERS[product];
  if (!provider) throw new Error(`[billing] No payment provider configured for product "${product}"`);
  return provider;
}
