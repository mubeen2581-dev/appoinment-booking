export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body || {})

  if (!result.success) {
    const message = String(result.error.issues?.[0]?.message || 'Invalid request body')
    const error = new Error(message)
    error.statusCode = 400
    return next(error)
  }

  req.validatedBody = result.data
  return next()
}
