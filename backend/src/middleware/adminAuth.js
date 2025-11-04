export const requireAdmin = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY

  if (!configuredKey) {
    return next()
  }

  const providedKey =
    req.headers['x-admin-key'] || req.headers['x-admin-token'] || req.query.adminKey

  if (providedKey !== configuredKey) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
