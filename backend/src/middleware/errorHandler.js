export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500
  const message = err.message || 'Something went wrong'

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${status} - ${message}`, err)
  }

  res.status(status).json({
    error: message,
  })
}
