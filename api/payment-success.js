export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Convert POST body to query params and redirect to frontend
    const params = new URLSearchParams(req.body).toString();
    res.redirect(307, `/payment-success?${params}`);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
