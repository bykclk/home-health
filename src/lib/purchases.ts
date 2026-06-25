/**
 * RevenueCat integration. Drives the `isPremium` flag from the "premium"
 * entitlement. Native-only and key-gated, so web / missing keys are no-ops
 * (the dev premium toggle still works there).
 */
import { Platform } from 'react-native';

import { setPremium } from '@/lib/premium';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
const ENTITLEMENT = 'premium';

const apiKey = Platform.OS === 'ios' ? IOS_KEY : Platform.OS === 'android' ? ANDROID_KEY : undefined;

export const PURCHASES_ENABLED = Platform.OS !== 'web' && !!apiKey;

type PurchasesModule = typeof import('react-native-purchases').default;
type PurchasePackage = import('react-native-purchases').PurchasesPackage;

let mod: PurchasesModule | undefined;
async function lib(): Promise<PurchasesModule> {
  if (!mod) mod = (await import('react-native-purchases')).default;
  return mod;
}

function sync(info: { entitlements: { active: Record<string, unknown> } }) {
  setPremium(!!info?.entitlements?.active?.[ENTITLEMENT]);
}

/** Configure the SDK and start syncing the entitlement. Call once on startup. */
export async function initPurchases(): Promise<void> {
  if (!PURCHASES_ENABLED) return;
  const Purchases = await lib();
  Purchases.configure({ apiKey: apiKey! });
  Purchases.addCustomerInfoUpdateListener((info) => sync(info as any));
  try {
    sync((await Purchases.getCustomerInfo()) as any);
  } catch {
    // ignore network hiccups; the listener will catch up
  }
}

/** Tie purchases to the signed-in user (enables restore across devices). */
export async function identifyUser(userId: string): Promise<void> {
  if (!PURCHASES_ENABLED) return;
  const Purchases = await lib();
  const { customerInfo } = await Purchases.logIn(userId);
  sync(customerInfo as any);
}

export async function logOutPurchases(): Promise<void> {
  if (!PURCHASES_ENABLED) return;
  const Purchases = await lib();
  try {
    sync((await Purchases.logOut()) as any);
  } catch {
    // logOut throws for anonymous users; ignore
  }
}

export async function getPackages(): Promise<PurchasePackage[]> {
  if (!PURCHASES_ENABLED) return [];
  const Purchases = await lib();
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Returns true if the user is now entitled. */
export async function purchase(pkg: PurchasePackage): Promise<boolean> {
  const Purchases = await lib();
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    sync(customerInfo as any);
    return !!customerInfo.entitlements.active[ENTITLEMENT];
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restore(): Promise<boolean> {
  if (!PURCHASES_ENABLED) return false;
  const Purchases = await lib();
  const info = await Purchases.restorePurchases();
  sync(info as any);
  return !!info.entitlements.active[ENTITLEMENT];
}
