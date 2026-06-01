import CryptoJS from "crypto-js";

const PAYU_KEY = import.meta.env.VITE_PAYU_KEY as string | undefined;
const PAYU_SALT = import.meta.env.VITE_PAYU_SALT as string | undefined;
const PAYU_ENDPOINT = "https://secure.payu.in/_payment";

export interface PayUParams {
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
}

export const generateTxnId = () => `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Hash format required by PayU:
 *   sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
 * Exactly 11 pipes between email and salt (5 udf slots + 6 reserved).
 */
export const buildPayUHash = (txnid: string, params: PayUParams) => {
  if (!PAYU_KEY || !PAYU_SALT) {
    throw new Error("PayU credentials are not configured (VITE_PAYU_KEY / VITE_PAYU_SALT).");
  }
  const hashString = `${PAYU_KEY}|${txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${PAYU_SALT}`;
  return { hash: CryptoJS.SHA512(hashString).toString(), hashString };
};

export const submitPayUForm = (txnid: string, params: PayUParams) => {
  if (!PAYU_KEY) throw new Error("VITE_PAYU_KEY is not set.");

  const { hash, hashString } = buildPayUHash(txnid, params);
  const origin = window.location.origin;

  const fields: Record<string, string> = {
    key: PAYU_KEY,
    txnid,
    amount: params.amount,
    productinfo: params.productinfo,
    firstname: params.firstname,
    email: params.email,
    phone: params.phone,
    surl: `${origin}/payment-success`,
    furl: `${origin}/payment-failure`,
    hash,
  };

  // Debug log (remove in production)
  // eslint-disable-next-line no-console
  console.log("[PayU] fields:", fields);
  // eslint-disable-next-line no-console
  console.log("[PayU] hashString:", hashString);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = PAYU_ENDPOINT;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
};

export const isPayUConfigured = () => Boolean(PAYU_KEY && PAYU_SALT);