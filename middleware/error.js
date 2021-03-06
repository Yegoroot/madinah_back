import ErrorResponse from '../utils/errorResponse.js'

/**
 * important to have a variable next
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = {
    ...err,
  }
  error.message = err.message

  // Mongoose bad objectID
  if (err.name === 'CastError') {
    const message = '404'
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate' // поле с уникальным значением уже имеется при создании
    error = new ErrorResponse(message, 400)
  }

  // Mongo Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}
export default errorHandler
