const sendData = (status, error, message, url) => {
    return {
        status,
        error,
        message,
        url
    }
}
module.exports = {sendData}