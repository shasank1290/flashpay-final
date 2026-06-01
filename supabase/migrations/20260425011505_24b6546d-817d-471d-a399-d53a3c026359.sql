ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS txnid TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCESS';

CREATE INDEX IF NOT EXISTS transactions_txnid_idx ON public.transactions(txnid);