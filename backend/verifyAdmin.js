function verifyAdmin(request, response, next) {
  if (!request.user.isAdmin) {
    return response.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  next();
}

module.exports = verifyAdmin;