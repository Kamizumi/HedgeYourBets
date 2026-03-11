// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Hello from Next.js API!',
    team: 'Hedge Your Bets',
    timestamp: new Date().toISOString()
  })
}
