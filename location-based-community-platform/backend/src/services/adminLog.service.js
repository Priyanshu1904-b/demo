const AdminLog = require("../models/AdminLog");

function logAdminAction({ action, performedBy, targetUser, targetPost, metadata }) {
  return AdminLog.create({ action, performedBy, targetUser, targetPost, metadata });
}

module.exports = { logAdminAction };
