// Next.js API route handler
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: 'hi this is not jason mar' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}