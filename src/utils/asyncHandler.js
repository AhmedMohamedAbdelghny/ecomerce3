

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            next(err)
        })
    }
}



export const GlobalErrorHandler = (err, req, res, next) => {
    res.status(err.statusCode || 500).json({ msgs: err.message, stack: err.stack })
    next()
}