// Export environment variables OR a string to be able to login on the dashboard

module.exports = {
    "username": process.env.EDW_USERNAME || "admin",
    "password": process.env.EDW_PASSWORD || "admin",
}
