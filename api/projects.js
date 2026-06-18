// Vercel Serverless Function — GET /api/projects
// Returns project portfolio data from JSON seed file.

import projects from "../data/projects.json" assert { type: "json" };

export default function handler(req, res) {
  const { id } = req.query;

  // Allow querying by year
  const { year } = req.query;
  let result = projects;

  if (year) {
    result = result.filter((p) => String(p.year) === year);
  }

  if (id) {
    result = result.filter((p) => p.id === id);
  }

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(result);
}
