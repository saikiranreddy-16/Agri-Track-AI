import NotificationHistory from '../models/notificationHistoryModel.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { eventType, isRead } = req.query;
    const filter = { userId: req.user._id };

    if (eventType && eventType !== 'All') filter.eventType = eventType;
    if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';

    const notifications = await NotificationHistory.find(filter)
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'name registration brand photo');

    return res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await NotificationHistory.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    return res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await NotificationHistory.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await NotificationHistory.findOneAndDelete({ _id: id, userId: req.user._id });
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};
