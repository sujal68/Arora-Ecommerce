module.exports.successResponse = (status, error = false, massage, result) => {
    return { status, error, massage, result }
}

module.exports.errorResponse = (status, error = false, massage) => {
    return { status, error, massage }
}