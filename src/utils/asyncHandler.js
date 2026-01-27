// wrapper function of async await
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        // Execute the async route handler
        await fn(req, res, next)
    } catch (error) {
        // Send error response if promise is rejected
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}

export { asyncHandler };

// // Wrapper function using Promise to handle async errors
// const asyncHandler1 = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next))
//             .catch((err) => next(err));
//     };
// };

// export { asyncHandler1 };