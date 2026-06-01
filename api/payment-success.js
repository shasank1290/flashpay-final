export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const params = new URLSearchParams(req.body).toString();

    return res.redirect(
      303,
      `/payment-success-ui?${params}`
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
}