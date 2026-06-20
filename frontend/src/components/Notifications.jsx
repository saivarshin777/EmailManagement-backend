import { useState } from "react";
import {
  MdCheckCircle,
  MdTrendingUp,
  MdPersonAdd,
  MdWarning,
  MdSettings,
  MdEmail,
  MdSearch,
  MdDoneAll,
  MdArrowBack,
} from "react-icons/md";

const notificationsData = [
  {
    id: 1,
    icon: MdCheckCircle,
    iconBg: "#e6f4ea",
    iconColor: "#2e7d32",
    title: "Campaign sent successfully",
    desc: "Summer Sale Blast reached 24,800 recipients",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    icon: MdTrendingUp,
    iconBg: "#fff8e1",
    iconColor: "#f57f17",
    title: "Open rate milestone hit!",
    desc: "Weekly Newsletter crossed 64% open rate",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    icon: MdPersonAdd,
    iconBg: "#e3f2fd",
    iconColor: "#1565c0",
    title: "500 new subscribers",
    desc: "Your list grew by 500 contacts this week",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: 4,
    icon: MdWarning,
    iconBg: "#fce4ec",
    iconColor: "#c62828",
    title: "Bounce rate warning",
    desc: "Promo SMS campaign bounce rate at 2.4%",
    time: "5 hrs ago",
    read: true,
  },
  {
    id: 5,
    icon: MdSettings,
    iconBg: "#f3e5f5",
    iconColor: "#6a1b9a",
    title: "Automation triggered",
    desc: "Re-engagement Flow sent to 320 contacts",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    icon: MdEmail,
    iconBg: "#e8f5e9",
    iconColor: "#2e7d32",
    title: "New reply received",
    desc: "A contact replied to your last campaign",
    time: "Yesterday",
    read: true,
  },
];

const iconByType = {
  campaign: MdEmail,
  system: MdSettings,
  warning: MdWarning,
  growth: MdTrendingUp,
};

export default function Notifications({
  theme,
  notifications: externalNotifications,
  onMarkRead,
  onMarkAllRead,
}) {
  const [localNotifications, setLocalNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : notificationsData;
  });
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [openedNotification, setOpenedNotification] = useState(null);
  const notifications = externalNotifications?.length ? externalNotifications : localNotifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async (event) => {
    event?.stopPropagation();
    if (onMarkAllRead) {
      await onMarkAllRead();
      return;
    }
    setLocalNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const markRead = async (id) => {
    if (onMarkRead) {
      await onMarkRead(id);
      return;
    }
    setLocalNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const openNotification = async (notification) => {
    setOpenedNotification({ ...notification, read: true });
    if (!notification.read) {
      await markRead(notification.id);
    }
  };

  const filtered = [...notifications]
    .sort((a, b) => {
      const parsedA = new Date(a.createdAt || a.time || 0).getTime();
      const parsedB = new Date(b.createdAt || b.time || 0).getTime();
      const aTime = Number.isNaN(parsedA) ? 0 : parsedA;
      const bTime = Number.isNaN(parsedB) ? 0 : parsedB;
      return bTime - aTime;
    })
    .filter(
      (n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.desc.toLowerCase().includes(search.toLowerCase())
    );
  const visibleNotifications = showAll ? filtered : filtered.slice(0, 5);

  return (
  <div
    style={{
      ...styles.page,
      background: theme ? "#111827" : "#f8fafc",
      color: theme ? "#ffffff" : "#000000",
    }}
  >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={{ ...styles.title, color: theme ? "#ffffff" : "#0f172a" }}>
            {openedNotification ? "Message" : "Notifications"}
          </span>
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button type="button" style={styles.markAllBtn} onClick={markAllRead}>
            <MdDoneAll size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Mark all as read
          </button>
        )}
      </div>

      {openedNotification ? (
        <div
          style={{
            ...styles.messagePane,
            background: theme ? "#374151" : "#ffffff",
            color: theme ? "#ffffff" : "#0f172a",
          }}
        >
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => setOpenedNotification(null)}
          >
            <MdArrowBack size={16} />
            Back to notifications
          </button>
          <div style={styles.messageMeta}>{openedNotification.time}</div>
          <h2 style={styles.messageTitle}>{openedNotification.title}</h2>
          <p
            style={{
              ...styles.messageBody,
              color: theme ? "#d1d5db" : "#475569",
            }}
          >
            {openedNotification.desc}
          </p>
        </div>
      ) : (
        <>
      {/* Search Bar */}
      <div
  style={{
    ...styles.searchWrapper,
    background: theme ? "#374151" : "#ffffff",
    border: theme
      ? "1px solid #4b5563"
      : "1.5px solid #e2e8f0",
  }}
>
        <MdSearch size={18} style={{ color: "#94a3b8", flexShrink: 0 }} />
        <input
          style={styles.searchInput}
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Notification List */}
      <div style={styles.list}>
        {filtered.length === 0 && (
          <div style={styles.empty}>No notifications found.</div>
        )}
        {visibleNotifications.map((n, i) => {
          const IconComponent = n.icon || iconByType[n.type] || MdCheckCircle;
          return (
            <div
              key={n.id}
              style={{
  ...styles.item,
  background: theme
    ? "#374151"
    : n.read
    ? "#ffffff"
    : "#f0f7ff",
  borderLeft: n.read ? "3px solid transparent" : "3px solid #2563eb",
  animation: `slideIn 0.3s ease ${i * 0.05}s both`,
}}
              onClick={() => openNotification(n)}
            >
              <div
                style={{
                  ...styles.iconBox,
                  background: n.iconBg || "#e3f2fd",
                }}
              >
                <IconComponent size={20} color={n.iconColor || "#1565c0"} />
              </div>
              <div style={styles.content}>
                <div
  style={{
    ...styles.notifTitle,
    color: theme ? "#ffffff" : "#0f172a",
  }}
>
                  {n.title}
                  {!n.read && <span style={styles.dot} />}
                </div>
               
               <div
  style={{
    ...styles.notifDesc,
    color: theme ? "#d1d5db" : "#64748b",
  }}
>
  {n.desc}
</div>
              </div>
              
              <div
  style={{
    ...styles.time,
    color: theme ? "#cbd5e1" : "#94a3b8",
  }}
>
  {n.time}
</div>
            </div>
          );
        })}
        {filtered.length > 5 && (
          <button
            type="button"
            style={{
              ...styles.viewAllBtn,
              color: theme ? "#cbd5e1" : "#475569",
              background: theme ? "#1f2937" : "#f8fafc",
              borderColor: theme ? "#334155" : "#e2e8f0",
            }}
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Show Less" : `View All Notifications (${filtered.length})`}
          </button>
        )}
      </div>
      </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    background: "transparent",
    minHeight: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.3px",
  },
  badge: {
    background: "#2563eb",
    color: "#fff",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 9px",
    minWidth: 24,
    textAlign: "center",
  },
  markAllBtn: {
    background: "none",
    border: "1.5px solid #2563eb",
    color: "#2563eb",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    padding: "8px 14px",
    marginBottom: 18,
    gap: 10,
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#334155",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "14px 16px",
    borderRadius: 12,
    cursor: "pointer",
    transition: "box-shadow 0.2s, transform 0.15s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#2563eb",
    display: "inline-block",
    flexShrink: 0,
  },
  notifDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.45,
  },
  time: {
    fontSize: 12,
    color: "#94a3b8",
    whiteSpace: "nowrap",
    marginTop: 2,
    flexShrink: 0,
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
    padding: "40px 0",
  },
  viewAllBtn: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
  },
  messagePane: {
    borderRadius: 14,
    padding: 22,
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    minHeight: 260,
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#2563eb",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 18,
  },
  messageMeta: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 24,
    lineHeight: 1.25,
    marginBottom: 14,
  },
  messageBody: {
    fontSize: 15,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
};
