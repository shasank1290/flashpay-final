export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Read and parse form data from request body
    const body = await req.text();
    const params = new URLSearchParams(body).toString();
    res.redirect(303, `/payment-failure?${params}`);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
