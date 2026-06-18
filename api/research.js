// Vercel Serverless Function — GET /api/research
// Returns research papers data from JSON seed file.

import papers from "../data/research.json" assert { type: "json" };

export default function handler(req, res) {
  const { id, topic } = req.query;
  let result = papers;

  if (topic) {
    result = result.filter((p) =>
      p.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))
    );
  }

  if (id) {
    result = result.filter((p) => p.id === id);
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(result);
}
