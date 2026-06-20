import { useState, useEffect } from "react";
import "../App.css";
import Sidebar from "../Sidebar";

import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import AdvancedAnalytics from "../components/AdvancedAnalytics";
import PerformanceChart from "../components/PerformanceChart";
import ChannelChart from "../components/ChannelChart";
import AnalyticsCards from "../components/AnalyticsCards";
import ProgressSection from "../components/ProgressSection";
import Notifications from "../components/Notifications";
import TopPerformers from "../components/TopPerformers";
import Footer from "../components/Footer";
import Schedule from "../components/Schedule";
import ContactGrowth from "../components/ContactGrowth";
import EmailUsage from "../components/EmailUsage";
import TemplateStudio from "../components/TemplateStudio";
import AutomationWorkflows from "../components/AutomationWorkflows";
import CampaignWizard from "../components/CampaignWizard";
import CommandPalette from "../components/CommandPalette";
import QuickActionCards from "../components/QuickActionCards";
import ToastStack from "../components/ToastStack";
import { contactApi, dashboardApi } from "../services/api";
import {
  FaMobileAlt,
  FaDesktop,
  FaTabletAlt,
  FaArrowUp,
  FaGlobeAsia,
  FaEnvelope,
  FaEnvelopeOpenText,
  FaLink,
  FaExclamationTriangle,
  FaUserPlus,
  FaBullhorn,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaUserSlash,
  FaBell,
  FaCog,
  FaSearch,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaSms,
  FaUserCircle,
  FaBolt,
  FaKeyboard,
} from "react-icons/fa";

function AdminDashboard()  {
 const [darkMode, setDarkMode] = useState(false);
const [activePage, setActivePage] = useState("Dashboard");
const [showCompose, setShowCompose] = useState(false);
const [showAddContact, setShowAddContact] = useState(false);
const [showImportContacts, setShowImportContacts] = useState(false);
const [contacts, setContacts] = useState([]);
const [contactLists, setContactLists] = useState([]);
const [activeContactListId, setActiveContactListId] = useState("all");
const [selectedContactIds, setSelectedContactIds] = useState([]);
const [newListName, setNewListName] = useState("");
const [newListDescription, setNewListDescription] = useState("");
const [newListColor, setNewListColor] = useState("#0f766e");
const [selectedContact, setSelectedContact] = useState(null);
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [city, setCity] = useState("");
const [status, setStatus] = useState("Lead");
const [page, setPage] = useState("dashboard");
const [searchTerm, setSearchTerm] = useState("");
const [dashboardData, setDashboardData] = useState(null);
const [analyticsData, setAnalyticsData] = useState(null);
const [analyticsLoading, setAnalyticsLoading] = useState(true);
const [campaignSearch, setCampaignSearch] = useState("");
const [searchedCampaigns, setSearchedCampaigns] = useState([]);
const [showAllSearchResults, setShowAllSearchResults] = useState(false);
const [showAllTopCampaigns, setShowAllTopCampaigns] = useState(false);
const [campaignName, setCampaignName] = useState("");
const [campaignSubject, setCampaignSubject] = useState("");
const [campaignContent, setCampaignContent] = useState("");
const [campaignRecipients, setCampaignRecipients] = useState("");
const [selectedCampaignListId, setSelectedCampaignListId] = useState("");
const [campaignError, setCampaignError] = useState("");
const [apiError, setApiError] = useState("");
const [notifications, setNotifications] = useState([]);
const [templates, setTemplates] = useState([]);
const [selectedTemplateId, setSelectedTemplateId] = useState("");
const [templateDraft, setTemplateDraft] = useState(null);
const [templateError, setTemplateError] = useState("");
const [showSmsComposer, setShowSmsComposer] = useState(false);
const [smsTarget, setSmsTarget] = useState(null);
const [smsMessage, setSmsMessage] = useState("");
const [sendingSms, setSendingSms] = useState(false);
const [commandOpen, setCommandOpen] = useState(false);
const [toasts, setToasts] = useState([]);
const [segmentFilter, setSegmentFilter] = useState("all");
const [locationFilter, setLocationFilter] = useState("all");
const [engagementFilter, setEngagementFilter] = useState("all");
const getContactId = (contact) => String(contact?._id || contact?.id || contact || "");
const showToast = (title, message = "", type = "info") => {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  setToasts((current) => [...current, { id, title, message, type }].slice(-4));
  window.setTimeout(() => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, 5200);
};
const dismissToast = (id) => {
  setToasts((current) => current.filter((toast) => toast.id !== id));
};
const activeContactList =
  activeContactListId === "all"
    ? null
    : contactLists.find((list) => list._id === activeContactListId || list.id === activeContactListId);
const activeContactListIds = new Set(
  (activeContactList?.contacts || []).map((contact) => getContactId(contact))
);
const scopedContacts = activeContactList
  ? contacts.filter((contact) => activeContactListIds.has(getContactId(contact)))
  : contacts;
const contactStats = {
  total: contacts.length,
  active: contacts.filter((contact) =>
    ["Customer", "Prospect"].includes(contact.status)
  ).length,
  newSubscribers: contacts.filter((contact) => {
    if (!contact.createdAt) return false;
    const created = new Date(contact.createdAt).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return created >= thirtyDaysAgo;
  }).length,
  inactive: contacts.filter((contact) => contact.status === "Inactive").length,
};
const uniqueLocations = [
  ...new Set(contacts.map((contact) => contact.city).filter(Boolean)),
].sort();
const segmentedContacts = scopedContacts.filter((contact) => {
  const created = contact.createdAt ? new Date(contact.createdAt).getTime() : 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const segmentMatches =
    segmentFilter === "all" ||
    (segmentFilter === "active" && ["Customer", "Prospect"].includes(contact.status)) ||
    (segmentFilter === "inactive" && contact.status === "Inactive") ||
    (segmentFilter === "recent" && created >= thirtyDaysAgo) ||
    (segmentFilter === "high-engagement" && contact.status === "Customer") ||
    (segmentFilter === "leads" && contact.status === "Lead");
  const locationMatches = locationFilter === "all" || contact.city === locationFilter;
  const engagementMatches =
    engagementFilter === "all" ||
    (engagementFilter === "opened" && ["Customer", "Prospect"].includes(contact.status)) ||
    (engagementFilter === "clicked" && contact.status === "Customer") ||
    (engagementFilter === "not-opened" && ["Lead", "Inactive"].includes(contact.status));

  return segmentMatches && locationMatches && engagementMatches;
});
const visibleContacts = segmentedContacts.filter((contact) => {
  const query = searchTerm.toLowerCase();
  return (
    contact.name?.toLowerCase().includes(query) ||
    contact.email?.toLowerCase().includes(query) ||
    contact.city?.toLowerCase().includes(query) ||
    contact.phone?.toLowerCase().includes(query)
  );
});
useEffect(() => {
  if (darkMode) {
    document.body.style.backgroundColor = "#111827";
    document.body.style.color = "#ffffff";
  } else {
    document.body.style.backgroundColor = "#f8fafc";
    document.body.style.color = "#000000";
  }
}, [darkMode]);

useEffect(() => {
  const handleShortcut = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      setCommandOpen((current) => !current);
    }
  };

  window.addEventListener("keydown", handleShortcut);
  return () => window.removeEventListener("keydown", handleShortcut);
}, []);
const loadContacts = async () => {
  try {
    const response = await contactApi.getContacts();
    const list = response.data.contacts || [];
    setContacts(list);
    setSelectedContact(list[0] || null);
  } catch (error) {
    console.error("Failed to load contacts:", error);
    setContacts([]);
  }
};

const loadContactLists = async () => {
  try {
    const response = await contactApi.getContactLists();
    const lists = response.data.lists || [];
    setContactLists(lists);

    if (
      activeContactListId !== "all" &&
      !lists.some((list) => list._id === activeContactListId || list.id === activeContactListId)
    ) {
      setActiveContactListId("all");
    }
  } catch (error) {
    console.error("Failed to load contact folders:", error);
    setContactLists([]);
  }
};

useEffect(() => {
  loadContacts();
  const interval = setInterval(loadContacts, 10000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  loadContactLists();
  const interval = setInterval(loadContactLists, 10000);
  return () => clearInterval(interval);
}, []);

const handleAddContact = async (newContact) => {
  try {
    const response = await contactApi.createContact(newContact);
    if (response.data.success) {
      await loadContacts();
      await loadContactLists();
      setSelectedContact(response.data.contact);
      showToast("Contact saved", `${newContact.name} was added to the audience.`, "success");
    }
  } catch (error) {
    console.error("Failed to add contact:", error);
    showToast("Contact save failed", error.response?.data?.message || "Failed to save contact", "error");
    return;
  }

  setName("");
  setEmail("");
  setPhone("");
  setCity("");
  setStatus("Lead");

  setShowAddContact(false);
};

const handleDeleteContact = async (contact) => {
  if (!contact?._id) return;

  try {
    await contactApi.deleteContact(contact._id);
    await loadContacts();
    await loadContactLists();
    showToast("Contact deleted", `${contact.name || "Contact"} was removed.`, "success");
  } catch (error) {
    console.error("Failed to delete contact:", error);
    showToast("Delete failed", error.response?.data?.message || "Failed to delete contact", "error");
  }
};

const toggleContactSelection = (contactId) => {
  setSelectedContactIds((current) =>
    current.includes(contactId)
      ? current.filter((id) => id !== contactId)
      : [...current, contactId]
  );
};

const selectAllVisibleContacts = () => {
  const visibleIds = visibleContacts.map((contact) => getContactId(contact));
  setSelectedContactIds((current) => {
    const allSelected = visibleIds.every((id) => current.includes(id));
    return allSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])];
  });
};

const resetContactFolderForm = () => {
  setNewListName("");
  setNewListDescription("");
  setNewListColor("#0f766e");
};

const handleCreateContactList = async () => {
  if (!newListName.trim()) {
    showToast("Folder name required", "Please enter a folder name.", "warning");
    return;
  }

  try {
    const response = await contactApi.createContactList({
      name: newListName,
      description: newListDescription,
      color: newListColor,
      contactIds: selectedContactIds,
    });
    await loadContactLists();
    setActiveContactListId(response.data.list._id);
    setSelectedContactIds([]);
    resetContactFolderForm();
    showToast("Contact folder created", `${response.data.list.name} is ready for campaigns.`, "success");
  } catch (error) {
    console.error("Failed to create contact folder:", error);
    showToast("Folder create failed", error.response?.data?.message || "Could not create contact folder.", "error");
  }
};

const handleAddSelectedToList = async (listId) => {
  if (selectedContactIds.length === 0) {
    showToast("Select contacts first", "Choose one or more contacts before adding them to a folder.", "warning");
    return;
  }

  try {
    await contactApi.addContactsToList(listId, { contactIds: selectedContactIds });
    await loadContactLists();
    setSelectedContactIds([]);
    showToast("Folder updated", "Selected contacts were added to the folder.", "success");
  } catch (error) {
    console.error("Failed to add contacts to folder:", error);
    showToast("Folder update failed", error.response?.data?.message || "Could not update contact folder.", "error");
  }
};

const handleRemoveSelectedFromList = async () => {
  if (!activeContactList || selectedContactIds.length === 0) return;

  try {
    await contactApi.removeContactsFromList(activeContactList._id, {
      contactIds: selectedContactIds,
    });
    await loadContactLists();
    setSelectedContactIds([]);
    showToast("Contacts removed", `Selected contacts were removed from ${activeContactList.name}.`, "success");
  } catch (error) {
    console.error("Failed to remove contacts from folder:", error);
    showToast("Remove failed", error.response?.data?.message || "Could not remove contacts from folder.", "error");
  }
};

const handleDeleteContactList = async (listId) => {
  if (!window.confirm("Delete this contact folder? Contacts will stay in your directory.")) return;

  try {
    await contactApi.deleteContactList(listId);
    await loadContactLists();
    setActiveContactListId("all");
    setSelectedContactIds([]);
    showToast("Contact folder deleted", "Contacts remain available in the full directory.", "success");
  } catch (error) {
    console.error("Failed to delete contact folder:", error);
    showToast("Folder delete failed", error.response?.data?.message || "Could not delete contact folder.", "error");
  }
};

const useContactListForCampaign = (list) => {
  setSelectedCampaignListId(list._id || list.id);
  setCampaignRecipients("");
  setActivePage("Campaigns");
  setShowCompose(true);
};

const openSmsComposer = (contact = null) => {
  setSmsTarget(contact);
  setSmsMessage("");
  setShowSmsComposer(true);
};

const handleSendSms = async () => {
  if (!smsMessage.trim()) {
    showToast("SMS message required", "Please enter an SMS message.", "warning");
    return;
  }

  setSendingSms(true);

  try {
    const response = smsTarget?._id
      ? await contactApi.sendSms(smsTarget._id, { message: smsMessage })
      : await contactApi.sendBulkSms({ message: smsMessage, search: searchTerm });

    showToast("SMS request completed", response.data.message || "SMS request completed.", "success");
    setShowSmsComposer(false);
    setSmsMessage("");
    setSmsTarget(null);
  } catch (error) {
    console.error("Failed to send SMS:", error);
    showToast("SMS failed", error.response?.data?.message || "Failed to send SMS.", "error");
  } finally {
    setSendingSms(false);
  }
};

const loadDashboard = async () => {
  try {
    const [dashboardResponse, notificationsResponse, analyticsResponse] = await Promise.all([
      dashboardApi.getDashboard(),
      dashboardApi.getNotifications(),
      dashboardApi.getAnalytics(),
    ]);
    setDashboardData(dashboardResponse.data);
    setNotifications(notificationsResponse.data);
    setAnalyticsData(analyticsResponse.data);
    setAnalyticsLoading(false);
    setSearchedCampaigns(dashboardResponse.data.campaigns);
    setApiError("");
  } catch (error) {
    console.error(error);
    setApiError("Backend is not running. Start it with npm run backend.");
    setAnalyticsLoading(false);
  }
};

useEffect(() => {
  loadDashboard();
  const interval = setInterval(loadDashboard, 10000);
  return () => clearInterval(interval);
}, []);

const loadTemplates = async () => {
  try {
    const response = await dashboardApi.getTemplates();
    const list = response.data || [];
    setTemplates(list);
    if (!templateDraft && list.length) {
      setSelectedTemplateId(list[0]._id);
      setTemplateDraft(list[0]);
    }
    setTemplateError("");
  } catch (error) {
    console.error(error);
    setTemplateError("Could not load templates. Please make sure the backend is running.");
  }
};

useEffect(() => {
  loadTemplates();
  const interval = setInterval(loadTemplates, 10000);
  return () => clearInterval(interval);
}, []);

const fallbackCampaigns = [
  {
    id: 1,
    name: "Summer Launch",
    subject: "Introducing our summer collection",
    status: "Active",
    emailsSent: 45000,
    delivered: 43820,
    opened: 36900,
    clicked: 6840,
    createdAt: "2026-05-26T09:30:00.000Z",
  },
  {
    id: 2,
    name: "Festive Offers",
    subject: "Festive discounts are here",
    status: "Completed",
    emailsSent: 30500,
    delivered: 29940,
    opened: 23180,
    clicked: 4825,
    createdAt: "2026-05-27T11:20:00.000Z",
  },
  {
    id: 3,
    name: "New Arrivals",
    subject: "Fresh products just dropped",
    status: "Running",
    emailsSent: 25800,
    delivered: 25250,
    opened: 17800,
    clicked: 3550,
    createdAt: "2026-05-28T14:45:00.000Z",
  },
];

const campaigns = dashboardData?.campaigns || fallbackCampaigns;
const topCampaigns = dashboardData?.topCampaigns || campaigns;
const campaignResults = campaignSearch ? searchedCampaigns : campaigns;
const visibleCampaignResults = showAllSearchResults
  ? campaignResults
  : campaignResults.slice(0, 3);
const activityIconByKind = {
  sent: <FaEnvelope />,
  open: <FaEnvelopeOpenText />,
  click: <FaLink />,
  warning: <FaExclamationTriangle />,
  user: <FaUserPlus />,
};
const activities = (dashboardData?.recentActivity || []).map((activity) => ({
  ...activity,
  icon: activityIconByKind[activity.kind] || <FaBullhorn />,
}));
const visibleActivities = activities.length
  ? activities
  : [
      {
        icon: <FaEnvelope />,
        text: 'Email campaign "Summer Launch" delivered to 43,820 contacts',
        time: "2 min ago",
        color: "#0f766e",
      },
    ];
const notificationSummary = dashboardData?.notificationsSummary || {
  total: notifications.length,
  unread: notifications.filter((item) => !item.read).length,
  campaignAlerts: notifications.filter((item) => item.type === "campaign").length,
  systemUpdates: notifications.filter((item) => item.type === "system").length,
};

const handleCampaignSearch = async (event) => {
  event?.preventDefault();
  try {
    const response = await dashboardApi.getCampaigns(campaignSearch);
    setSearchedCampaigns(response.data);
    setShowAllSearchResults(false);
  } catch (error) {
    console.error(error);
    const query = campaignSearch.toLowerCase();
    setSearchedCampaigns(
      campaigns.filter((campaign) =>
        [campaign.name, campaign.subject, campaign.status].some((field) =>
          String(field).toLowerCase().includes(query)
        )
      )
    );
    setShowAllSearchResults(false);
  }
};

const resetCampaignForm = () => {
  setCampaignName("");
  setCampaignSubject("");
  setCampaignContent("");
  setCampaignRecipients("");
  setSelectedCampaignListId("");
  setCampaignError("");
};

const openCampaignWizard = () => {
  setActivePage("Campaigns");
  setShowCompose(true);
};

const openAddContact = () => {
  setActivePage("Contacts");
  setShowAddContact(true);
};

const selectedTemplate = templates.find((template) => template._id === selectedTemplateId) || null;
const selectedCampaignList =
  contactLists.find((list) => list._id === selectedCampaignListId || list.id === selectedCampaignListId) || null;

const selectTemplate = (template) => {
  setSelectedTemplateId(template._id);
  setTemplateDraft({ ...template });
};

const createBlankTemplate = () => {
  const blank = {
    name: "Untitled Template",
    subject: "Campaign update",
    templateType: "Custom",
    background: "#f8fafc",
    accentColor: "#0f766e",
    htmlContent: "<h1>{{campaignName}}</h1><p>{{content}}</p><p>Add your campaign details here.</p>",
    textContent: "{{campaignName}}\n\n{{content}}\n\nAdd your campaign details here.",
  };
  setSelectedTemplateId("");
  setTemplateDraft(blank);
};

const handleTemplateDraftChange = (field, value) => {
  setTemplateDraft((current) => ({
    ...(current || {}),
    [field]: value,
  }));
};

const handleSaveTemplate = async () => {
  if (!templateDraft?.name?.trim()) {
    setTemplateError("Template name is required.");
    return;
  }

  try {
    const response = templateDraft._id
      ? await dashboardApi.updateTemplate(templateDraft._id, templateDraft)
      : await dashboardApi.createTemplate(templateDraft);
    await loadTemplates();
    setSelectedTemplateId(response.data._id);
    setTemplateDraft(response.data);
    setTemplateError("");
    showToast("Template saved", `${response.data.name} is ready for campaigns.`, "success");
  } catch (error) {
    console.error(error);
    setTemplateError("Could not save template.");
    showToast("Template save failed", "Could not save template.", "error");
  }
};

const handleDeleteTemplate = async () => {
  if (!templateDraft?._id) return;
  if (!window.confirm("Delete this template?")) return;

  try {
    await dashboardApi.deleteTemplate(templateDraft._id);
    const remaining = templates.filter((template) => template._id !== templateDraft._id);
    setTemplates(remaining);
    setSelectedTemplateId(remaining[0]?._id || "");
    setTemplateDraft(remaining[0] || null);
  } catch (error) {
    console.error(error);
    setTemplateError("Could not delete template.");
  }
};

const useTemplateForCampaign = (template = templateDraft) => {
  if (!template) return;
  setSelectedTemplateId(template._id || selectedTemplateId);
  setCampaignSubject(template.subject || campaignSubject);
  if (!campaignContent.trim()) {
    setCampaignContent("Write the message that should replace {{content}} in this template.");
  }
  setActivePage("Campaigns");
  setShowCompose(true);
};

const handleCreateCampaign = async (status = "Running") => {
  if (!campaignName.trim() || !campaignSubject.trim()) {
    setCampaignError("Campaign name and email subject are required.");
    return;
  }

  try {
    const response = await dashboardApi.createCampaign({
      name: campaignName,
      subject: campaignSubject,
      content: campaignContent,
      recipients: campaignRecipients,
      contactListId: selectedCampaignListId,
      templateId: selectedTemplateId,
      htmlContent: selectedTemplate?.htmlContent,
      textContent: selectedTemplate?.textContent,
      templateBackground: selectedTemplate?.background,
      templateAccentColor: selectedTemplate?.accentColor,
      status,
    });
    await loadDashboard();
    await handleCampaignSearch();
    resetCampaignForm();
    setShowCompose(false);
    const sendStatus = response.data?.campaign?.sendStatus;
    const sendError = response.data?.campaign?.sendError;
    showToast(
      status === "Draft"
        ? "Campaign draft saved"
        : sendStatus === "failed"
        ? "Campaign saved with send issue"
        : "Campaign sent successfully",
      status === "Draft"
        ? "You can continue editing this campaign later."
        : sendStatus === "failed"
        ? sendError
        : "Campaign performance will appear in analytics after delivery.",
      sendStatus === "failed" ? "warning" : "success"
    );
  } catch (error) {
    console.error(error);
    const message =
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Could not save campaign. Please make sure the backend is running.";
    setCampaignError(message);
    showToast("Campaign save failed", message, "error");
  }
};

const handleMarkNotificationRead = async (id) => {
  try {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    const response = await dashboardApi.markNotificationRead(id);
    setNotifications(response.data);
    await loadDashboard();
  } catch (error) {
    console.error(error);
  }
};

const handleMarkAllNotificationsRead = async () => {
  try {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    );
    const response = await dashboardApi.markAllNotificationsRead();
    setNotifications(response.data);
    await loadDashboard();
  } catch (error) {
    console.error(error);
  }
};

  return (
   <div className={`layout ${darkMode ? "dark-mode" : ""}`}>
     <Sidebar
  activePage={activePage}
  setActivePage={setActivePage}
/>
<div className="main">
  <Navbar
    darkMode={darkMode}
    setDarkMode={setDarkMode}
    campaignSearch={campaignSearch}
    setCampaignSearch={setCampaignSearch}
    onCampaignSearch={(event) => {
      handleCampaignSearch(event);
      setActivePage("Campaigns");
    }}
    onNotificationsClick={() => setActivePage("Notifications")}
    unreadNotifications={notificationSummary.unread}
  />

  <div className="workspace-strip">
    <div className="breadcrumbs">
      <span>MailNova Pro</span>
      <strong>{activePage}</strong>
    </div>
    <button type="button" className="command-trigger" onClick={() => setCommandOpen(true)}>
      <FaKeyboard />
      Command Palette
      <span>Ctrl K</span>
    </button>
  </div>

  <ToastStack toasts={toasts} onDismiss={dismissToast} />
  <CommandPalette
    open={commandOpen}
    onClose={() => setCommandOpen(false)}
    setActivePage={setActivePage}
    openCompose={openCampaignWizard}
    openAddContact={openAddContact}
  />

 
{activePage === "Campaigns" && (
  <>
    <div className="page-hero compact-hero">
      <div>
        <span className="eyebrow">Campaign Operations</span>
        <h1>Campaigns</h1>
        <p>
          Build, launch, and monitor campaigns with saved templates and verified audience folders.
        </p>
      </div>

      <div className="campaign-header-actions">
    <button
      className="template-btn"
      onClick={() => setActivePage("Templates")}
    >
      Templates
    </button>

    <button
      className="compose-btn"
      onClick={openCampaignWizard}
      style={{
        background: "#0f766e",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      + Compose Campaign
    </button>
      </div>
    </div>

{apiError && (
  <div
    style={{
      background: "#fef3c7",
      color: "#92400e",
      padding: "10px 14px",
      borderRadius: "8px",
      marginBottom: "15px",
      fontWeight: "600",
    }}
  >
    {apiError}
  </div>
)}

<div className="chart-box">
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      marginBottom: "10px",
    }}
  >
    <h3>Campaign Search Results</h3>

    {campaignResults.length > 3 && (
      <button
        onClick={() => setShowAllSearchResults((current) => !current)}
        style={{
          background: "#f3f4f6",
          border: "none",
          padding: "10px 14px",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        {showAllSearchResults ? "Show Less" : "View All"}
      </button>
    )}
  </div>

  {campaignResults.length === 0 && (
    <p style={{ marginTop: "15px", color: "#64748b" }}>No campaigns found.</p>
  )}

  {visibleCampaignResults.map((campaign) => (
    <div
      key={campaign.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "14px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <div>
        <h4 style={{ margin: 0 }}>{campaign.name}</h4>
        <p style={{ margin: "5px 0", color: "#64748b" }}>{campaign.subject}</p>
      </div>

      <div style={{ textAlign: "right" }}>
        <strong>{campaign.emailsSent.toLocaleString()} sent</strong>
        <p style={{ margin: "5px 0", color: "#16a34a" }}>
          {campaign.emailsSent ? Math.round((campaign.opened / campaign.emailsSent) * 100) : 0}% open rate
        </p>
        {campaign.sendStatus && (
          <small
            style={{
              color: campaign.sendStatus === "failed" ? "#ef4444" : "#64748b",
              fontWeight: "600",
            }}
          >
            Email: {campaign.sendStatus}
          </small>
        )}
      </div>
    </div>
  ))}
</div>

     {showCompose && (
      <CampaignWizard
        campaignName={campaignName}
        campaignSubject={campaignSubject}
        campaignContent={campaignContent}
        campaignRecipients={campaignRecipients}
        contactLists={contactLists}
        templates={templates}
        selectedCampaignList={selectedCampaignList}
        selectedCampaignListId={selectedCampaignListId}
        selectedTemplate={selectedTemplate}
        selectedTemplateId={selectedTemplateId}
        campaignError={campaignError}
        setCampaignName={setCampaignName}
        setCampaignSubject={setCampaignSubject}
        setCampaignContent={setCampaignContent}
        setCampaignRecipients={setCampaignRecipients}
        setSelectedCampaignListId={setSelectedCampaignListId}
        setSelectedTemplateId={setSelectedTemplateId}
        onClose={() => {
          resetCampaignForm();
          setShowCompose(false);
        }}
        onDraft={() => handleCreateCampaign("Draft")}
        onSend={() => handleCreateCampaign("Running")}
        onManageFolder={() => setActivePage("Contacts")}
        onOpenTemplates={() => setActivePage("Templates")}
        showToast={showToast}
      />
    )}

    <StatsCards darkMode={darkMode} stats={dashboardData?.stats} />

    <div className="charts">
      <PerformanceChart data={dashboardData?.performance} />
    </div>

    <TopPerformers
      campaigns={topCampaigns}
      showAll={showAllTopCampaigns}
      onViewAll={() => setShowAllTopCampaigns((current) => !current)}
    />

<div className="chart-box">
  <h3>Recent Campaign Activity</h3>

  {visibleActivities.map((item, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        gap: "10px",
        padding: "10px 0",
        borderBottom: "1px solid #eee",
      }}
    >
      <span style={{ color: item.color }}>
        {item.icon}
      </span>

      <span>{item.text}</span>
    </div>
  ))}
</div>
  </>
)}

{activePage === "Templates" && (
  <>
    <div className="page-hero compact-hero">
      <div>
        <span className="eyebrow">Template Studio</span>
        <h1>Templates</h1>
        <p>
          Maintain reusable email layouts, brand blocks, and content patterns for campaign teams.
        </p>
      </div>
      <button type="button" className="compose-btn" onClick={() => setActivePage("Campaigns")}>
        Back to Campaigns
      </button>
    </div>

    <div className="template-studio-shell">
      <TemplateStudio
        onUseTemplate={(template) => {
          setTemplates((current) =>
            current.some((item) => item._id === template._id)
              ? current.map((item) => (item._id === template._id ? template : item))
              : [template, ...current]
          );
          setSelectedTemplateId(template._id);
          setTemplateDraft(template);
          setCampaignSubject(template.subject || campaignSubject);
          setCampaignContent((current) =>
            current.trim()
              ? current
              : "Write the campaign message that should replace {{content}} in this template."
          );
          setActivePage("Campaigns");
          setShowCompose(true);
        }}
      />
    </div>
  </>
)}

{false && activePage === "Templates" && (
  <>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div>
        <h1>Templates</h1>
        <p style={{ color: "#64748b", marginTop: "6px" }}>
          Select, edit, preview, and reuse campaign email templates.
        </p>
      </div>

      <button className="compose-btn" onClick={createBlankTemplate}>
        + New Template
      </button>
    </div>

    {templateError && (
      <div
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "10px 14px",
          borderRadius: "8px",
          marginBottom: "15px",
          fontWeight: "600",
        }}
      >
        {templateError}
      </div>
    )}

    <div className="chart-box">
      <div className="template-grid">
        <div>
          <h3 style={{ marginBottom: "12px" }}>Saved Templates</h3>
          <div className="template-list">
            {templates.map((template) => (
              <button
                key={template._id}
                className={templateDraft?._id === template._id ? "active" : ""}
                onClick={() => selectTemplate(template)}
              >
                <strong>{template.name}</strong>
                <p style={{ margin: "4px 0", color: "#64748b" }}>
                  {template.subject || "No subject"}
                </p>
                <small>{template.templateType || "Custom"}</small>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!templateDraft ? (
            <p style={{ color: "#64748b" }}>Choose or create a template to start editing.</p>
          ) : (
            <div className="template-editor">
              <div>
                <input
                  type="text"
                  placeholder="Template name"
                  value={templateDraft.name || ""}
                  onChange={(e) => handleTemplateDraftChange("name", e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                />
                <input
                  type="text"
                  placeholder="Default email subject"
                  value={templateDraft.subject || ""}
                  onChange={(e) => handleTemplateDraftChange("subject", e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                />
                <input
                  type="text"
                  placeholder="Template category"
                  value={templateDraft.templateType || ""}
                  onChange={(e) => handleTemplateDraftChange("templateType", e.target.value)}
                  style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label>
                    Background
                    <input
                      type="color"
                      value={templateDraft.background || "#f8fafc"}
                      onChange={(e) => handleTemplateDraftChange("background", e.target.value)}
                      style={{ width: "100%", height: "42px", marginTop: "6px" }}
                    />
                  </label>
                  <label>
                    Accent
                    <input
                      type="color"
                      value={templateDraft.accentColor || "#2563eb"}
                      onChange={(e) => handleTemplateDraftChange("accentColor", e.target.value)}
                      style={{ width: "100%", height: "42px", marginTop: "6px" }}
                    />
                  </label>
                </div>

                <textarea
                  placeholder="Template HTML. Use {{content}}, {{campaignName}}, {{subject}}, {{recipientCount}}."
                  rows="10"
                  value={templateDraft.htmlContent || ""}
                  onChange={(e) => handleTemplateDraftChange("htmlContent", e.target.value)}
                  style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                />

                <textarea
                  placeholder="Plain text fallback"
                  rows="5"
                  value={templateDraft.textContent || ""}
                  onChange={(e) => handleTemplateDraftChange("textContent", e.target.value)}
                  style={{ width: "100%", padding: "12px", marginTop: "10px" }}
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                  <button className="compose-btn" onClick={handleSaveTemplate}>
                    Save Template
                  </button>
                  <button className="template-btn" onClick={() => useTemplateForCampaign(templateDraft)}>
                    Use in Campaign
                  </button>
                  {templateDraft._id && (
                    <button
                      onClick={handleDeleteTemplate}
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div
                className="template-preview"
                style={{ background: templateDraft.background || "#f8fafc" }}
              >
                <div
                  style={{
                    height: "8px",
                    background: templateDraft.accentColor || "#2563eb",
                  }}
                />
                <div
                  className="template-preview-inner"
                  dangerouslySetInnerHTML={{
                    __html: (templateDraft.htmlContent || "<p>Template preview</p>")
                      .replaceAll("{{campaignName}}", campaignName || "Campaign Name")
                      .replaceAll("{{subject}}", campaignSubject || templateDraft.subject || "Subject")
                      .replaceAll("{{content}}", campaignContent || "Your campaign content appears here.")
                      .replaceAll("{{recipientCount}}", "3"),
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
)}
  
  {/* CONTACTS */}
  {activePage === "Contacts" && (
  <>
    <div className="page-hero compact-hero">
      <div>
        <span className="eyebrow">Audience Management</span>
        <h1>Contacts</h1>
        <p>
          Maintain audience quality, organize folders, and prepare recipient groups for campaign delivery.
        </p>
      </div>

      <div className="campaign-header-actions">
        <button
          className="accent-btn amber-btn"
          onClick={() => setShowAddContact(true)}
        >
          + Add Contact
        </button>

        <button
          className="accent-btn dark-btn"
          onClick={() => setShowImportContacts(true)}
        >
          Import Contacts
        </button>

        <button
          className="accent-btn green-btn"
          onClick={() => openSmsComposer(null)}
        >
          Send SMS
        </button>
      </div>
    </div>

    <ContactGrowth />
    <div className="contact-stats-grid">
      <div className="chart-box">
        <FaUsers size={30} color="#0f766e" />
        <h4>Total Contacts</h4>
        <h2>{contactStats.total.toLocaleString()}</h2>
      </div>

      <div className="chart-box">
        <FaUserPlus size={30} color="#d97706" />
        <h4>New Subscribers</h4>
        <h2>{contactStats.newSubscribers.toLocaleString()}</h2>
      </div>

      <div className="chart-box">
        <FaCheckCircle size={30} color="#059669" />
        <h4>Active Contacts</h4>
        <h2>{contactStats.active.toLocaleString()}</h2>
      </div>

      <div className="chart-box">
        <FaUserSlash size={30} color="#dc2626" />
        <h4>Inactive</h4>
        <h2>{contactStats.inactive.toLocaleString()}</h2>
      </div>
    </div>

    <div className="contact-workspace">
      <div className="contact-folder-panel">
        <div className="panel-heading">
          <div>
            <h3>Contact Folders</h3>
            <p>Reusable recipient groups for campaigns.</p>
          </div>
          <span>{contactLists.length}</span>
        </div>

        <button
          type="button"
          className={activeContactListId === "all" ? "contact-folder-card active" : "contact-folder-card"}
          onClick={() => {
            setActiveContactListId("all");
            setSelectedContactIds([]);
          }}
        >
          <span className="folder-dot" style={{ background: "#111827" }} />
          <div>
            <strong>All Contacts</strong>
            <small>{contacts.length} total contacts</small>
          </div>
        </button>

        {contactLists.map((list) => (
          <div
            key={list._id}
            className={activeContactListId === list._id ? "contact-folder-card active" : "contact-folder-card"}
          >
            <button
              type="button"
              onClick={() => {
                setActiveContactListId(list._id);
                setSelectedContactIds([]);
              }}
            >
              <span className="folder-dot" style={{ background: list.color || "#0f766e" }} />
              <div>
                <strong>{list.name}</strong>
                <small>{list.contactCount || list.contacts?.length || 0} contacts</small>
              </div>
            </button>

            <div className="folder-actions">
              <button type="button" onClick={() => useContactListForCampaign(list)}>
                Campaign
              </button>
              {selectedContactIds.length > 0 && (
                <button type="button" onClick={() => handleAddSelectedToList(list._id)}>
                  Add Selected
                </button>
              )}
              <button type="button" onClick={() => handleDeleteContactList(list._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="contact-folder-form">
        <div>
          <h3>Create Contact Folder</h3>
          <p>
            Select contacts from the directory, name the folder, then use it directly in Campaigns.
          </p>
        </div>
        <div className="folder-form-grid">
          <input
            type="text"
            placeholder="Folder name, e.g. Enterprise Leads"
            value={newListName}
            onChange={(event) => setNewListName(event.target.value)}
          />
          <input
            type="text"
            placeholder="Short description"
            value={newListDescription}
            onChange={(event) => setNewListDescription(event.target.value)}
          />
          <input
            type="color"
            value={newListColor}
            onChange={(event) => setNewListColor(event.target.value)}
            aria-label="Folder color"
          />
          <button type="button" className="compose-btn" onClick={handleCreateContactList}>
            Create Folder
          </button>
        </div>
        <div className="selection-toolbar">
          <span>{selectedContactIds.length} selected</span>
          {activeContactList && selectedContactIds.length > 0 && (
            <button type="button" onClick={handleRemoveSelectedFromList}>
              Remove from {activeContactList.name}
            </button>
          )}
          {activeContactList && (
            <button type="button" onClick={() => useContactListForCampaign(activeContactList)}>
              Use {activeContactList.name} in Campaign
            </button>
          )}
        </div>
      </div>
    </div>

    <div className="chart-box segmentation-panel">
      <div className="section-header">
        <div>
          <h3>Advanced Audience Segmentation</h3>
          <p>Filter contacts by activity, engagement, location, folder, and campaign response signals.</p>
        </div>
        <span className="segment-count">{visibleContacts.length} matched</span>
      </div>

      <div className="segment-chip-row">
        {[
          ["all", "All contacts"],
          ["active", "Active users"],
          ["inactive", "Inactive users"],
          ["recent", "Recently added"],
          ["high-engagement", "High engagement"],
          ["leads", "Leads"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            className={segmentFilter === value ? "active" : ""}
            onClick={() => setSegmentFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="segment-filter-grid">
        <label>
          Location
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="all">All locations</option>
            {uniqueLocations.map((location) => (
              <option value={location} key={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label>
          Campaign response
          <select value={engagementFilter} onChange={(event) => setEngagementFilter(event.target.value)}>
            <option value="all">All response types</option>
            <option value="opened">Opened equivalent</option>
            <option value="clicked">Clicked equivalent</option>
            <option value="not-opened">Not opened equivalent</option>
          </select>
        </label>
        <label>
          Folder context
          <input value={activeContactList ? activeContactList.name : "All Contacts"} readOnly />
        </label>
      </div>
    </div>

    {showAddContact && (
      <div className="chart-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h3>Add New Contact</h3>

          <button
  onClick={() => {
    setName("");
    setEmail("");
    setPhone("");
    setCity("");
    setStatus("Lead");
    setShowAddContact(false);
  }}
  style={{
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
  Close
</button>
        </div>

        <input
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
  }}
/>

<input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
  }}
/>

<input
  type="text"
  placeholder="Phone Number"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
  }}
/>

<input
  type="text"
  placeholder="City"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
  }}
/>

<select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
  }}
>
  <option>Lead</option>
  <option>Prospect</option>
  <option>Customer</option>
  <option>Inactive</option>
</select>

<button
  onClick={() =>
    handleAddContact({
      name,
      email,
      phone,
      city,
      status,
    })
  }
  style={{
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
  }}
>
  Save Contact
</button>


        
      </div>
    )}

    {showImportContacts && (
      <div className="chart-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h3>Import Contacts</h3>

          <button
            onClick={() => setShowImportContacts(false)}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
            }}
          >
            Close
          </button>
        </div>

        <input
          type="file"
          style={{
            marginBottom: "15px",
          }}
        />

        <button
          style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
          }}
        >
          Upload CSV
        </button>
      </div>
    )}

    {showSmsComposer && (
      <div className="chart-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h3>
            {smsTarget
              ? `Send SMS to ${smsTarget.name}`
              : `Send SMS to ${visibleContacts.length} contact${visibleContacts.length === 1 ? "" : "s"}`}
          </h3>

          <button
            onClick={() => {
              setShowSmsComposer(false);
              setSmsTarget(null);
              setSmsMessage("");
            }}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <textarea
          placeholder="Type your SMS message..."
          value={smsMessage}
          onChange={(e) => setSmsMessage(e.target.value.slice(0, 320))}
          rows={4}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            resize: "vertical",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            {smsMessage.length}/320 characters
          </span>

          <button
            onClick={handleSendSms}
            disabled={sendingSms}
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {sendingSms ? "Sending..." : "Send SMS"}
          </button>
        </div>
      </div>
    )}

    <div className="chart-box">
      <div className="section-header">
        <div>
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <FaUsers />
            {activeContactList ? activeContactList.name : "Contact Directory"}
          </h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            {activeContactList
              ? `${visibleContacts.length} contacts in this folder`
              : `${visibleContacts.length} contacts visible`}
          </p>
        </div>
        <button type="button" className="template-btn" onClick={selectAllVisibleContacts}>
          {visibleContacts.every((contact) => selectedContactIds.includes(getContactId(contact))) && visibleContacts.length
            ? "Clear Visible"
            : "Select Visible"}
        </button>
      </div>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    marginTop: "15px",
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    width: "320px",
  }}
>
  <FaSearch color="#64748b" />

 <input
  type="text"
  placeholder="Search contacts..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  style={{
    border: "none",
    outline: "none",
    width: "100%",
  }}
/>
</div>
  {selectedContactIds.length > 0 && (
    <div className="selection-strip">
      <strong>{selectedContactIds.length} selected</strong>
      <span>Select a folder card’s Add Selected button to add these contacts, or create a new folder above.</span>
    </div>
  )}
</div>

      <div className="table-scroll">
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
          <thead>
  <tr
    style={{
      background: "#111827",
      color: "#fff",
    }}
  >
    <th>
      <input
        type="checkbox"
        checked={
          visibleContacts.length > 0 &&
          visibleContacts.every((contact) => selectedContactIds.includes(getContactId(contact)))
        }
        onChange={selectAllVisibleContacts}
      />
    </th>
    <th>Name</th>
    <th>Email</th>
    <th>Phone</th>
    <th>City</th>
    <th>Status</th>
    <th>Action</th>
  </tr>
</thead>
       <tbody>
 {visibleContacts.map((contact, index) => (
    <tr key={contact._id || index}>
      <td>
        <input
          type="checkbox"
          checked={selectedContactIds.includes(getContactId(contact))}
          onChange={() => toggleContactSelection(getContactId(contact))}
        />
      </td>
      <td>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    <FaUserCircle
      size={24}
      color="#0f766e"
    />

    {contact.name}
  </div>
</td>
      <td>{contact.email}</td>
      <td>
  <FaPhone
    style={{
      marginRight: "6px",
      color: "#22c55e",
    }}
  />
  {contact.phone}
</td>
      <td>
  <FaMapMarkerAlt
    style={{
      marginRight: "6px",
      color: "#ef4444",
    }}
  />
  {contact.city}
</td>
      <td>
  <span
    style={{
      background:
        contact.status === "Customer"
          ? "#dcfce7"
          : "#fef3c7",
      color:
        contact.status === "Customer"
          ? "#166534"
          : "#92400e",
      padding: "6px 12px",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: "12px",
    }}
  >
    {contact.status}
  </span>
</td>
      <td>
  <div
    style={{
      display: "flex",
      gap: "12px",
      justifyContent: "center",
    }}
  >
    <FaEye
      color="#0f766e"
      style={{ cursor: "pointer" }}
    />

    <FaEdit
      color="#f97316"
      style={{ cursor: "pointer" }}
    />

    <FaSms
      color="#22c55e"
      style={{ cursor: "pointer" }}
      onClick={() => openSmsComposer(contact)}
    />

    <FaTrash
      color="#ef4444"
      style={{ cursor: "pointer" }}
      onClick={() =>
        handleDeleteContact(contact)
      }
    />
  </div>
</td>
    </tr>
  ))}
  {visibleContacts.length === 0 && (
    <tr>
      <td colSpan="7">
        <div className="empty-state">
          <FaUsers />
          <strong>No contacts match this segment</strong>
          <p>Adjust filters, choose another folder, or add contacts to build this audience.</p>
          <button type="button" className="compose-btn" onClick={openAddContact}>
            Add Contact
          </button>
        </div>
      </td>
    </tr>
  )}
</tbody>
</table>
      </div>
</div> 
</>   
)}

  {activePage === "Automations" && (
    <AutomationWorkflows
      contactLists={contactLists}
      setActivePage={setActivePage}
      showToast={showToast}
    />
  )}
          
            

  {/* ANALYTICS */}
  {activePage === "Analytics" && (
    <AdvancedAnalytics
      analytics={analyticsData}
      loading={analyticsLoading}
      darkMode={darkMode}
    />
  )}
  {/* NOTIFICATIONS PAGE */}
{activePage === "Notifications" && (
  <>
    {/* Header */}
    <div style={{ marginBottom: "25px" }}>
      <h1>Notification Center</h1>
      <p style={{ color: "#64748b" }}>
        Monitor campaign alerts, system updates and platform health in real time.
      </p>
    </div>
    

    {/* Summary Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "15px",
        marginBottom: "20px",
      }}
    >
      <div
        className="chart-box"
        style={{
          padding: "15px",
          minHeight: "90px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "28px" }}>
          {notificationSummary.total}
        </h2>

        <p
          style={{
            margin: "4px 0",
            fontSize: "14px",
          }}
        >
          Total Alerts
        </p>

        <small style={{ color: "#22c55e" }}>
          +12% this week
        </small>
      </div>

      <div
        className="chart-box"
        style={{
          padding: "15px",
          minHeight: "90px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "28px" }}>
          {notificationSummary.unread}
        </h2>

        <p
          style={{
            margin: "4px 0",
            fontSize: "14px",
          }}
        >
          Unread
        </p>

        <small style={{ color: "#d97706" }}>
          Needs Attention
        </small>
      </div>

      <div
        className="chart-box"
        style={{
          padding: "15px",
          minHeight: "90px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "28px" }}>
          {notificationSummary.campaignAlerts}
        </h2>

        <p
          style={{
            margin: "4px 0",
            fontSize: "14px",
          }}
        >
          Campaign Alerts
        </p>

        <small style={{ color: "#3b82f6" }}>
          Active
        </small>
      </div>

      <div
        className="chart-box"
        style={{
          padding: "15px",
          minHeight: "90px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h2 style={{ margin: "0", fontSize: "28px" }}>
          {notificationSummary.systemUpdates}
        </h2>

        <p
          style={{
            margin: "4px 0",
            fontSize: "14px",
          }}
        >
          System Updates
        </p>

        <small style={{ color: "#7c3aed" }}>
          Latest
        </small>
      </div>
    </div>

    {/* Notifications & Activity */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        marginBottom: "20px",
      }}
    >
      <div className="chart-box">
        <h2>Recent Notifications</h2>
        <Notifications
          theme={darkMode}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />
      </div>

      <div className="chart-box">
        <h2>Recent Activity</h2>

        {visibleActivities.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span
              style={{
                color: item.color,
                fontSize: "18px",
              }}
            >
              {item.icon}
            </span>

            <div>
              <div>{item.text}</div>

              <small
                style={{
                  color: "#64748b",
                }}
              >
                {item.time}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Bottom Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
      }}
    >
      <div className="chart-box">
        <h2>System Health</h2>

        <div className="metric-row">
          <span>Email Server</span>
          <strong style={{ color: "#22c55e" }}>
            Healthy
          </strong>
        </div>

        <div className="metric-row">
          <span>Database</span>
          <strong style={{ color: "#22c55e" }}>
            Online
          </strong>
        </div>

        <div className="metric-row">
          <span>API Services</span>
          <strong style={{ color: "#22c55e" }}>
            Running
          </strong>
        </div>

        <div className="metric-row">
          <span>Backup Status</span>
          <strong style={{ color: "#22c55e" }}>
            Completed
          </strong>
        </div>
      </div>

      <div className="chart-box">
        <h2>Notification Trends</h2>

        <div className="metric-row">
          <span>Campaign Alerts</span>
          <strong>42%</strong>
        </div>

        <div className="metric-row">
          <span>System Updates</span>
          <strong>28%</strong>
        </div>

        <div className="metric-row">
          <span>User Activity</span>
          <strong>20%</strong>
        </div>

        <div className="metric-row">
          <span>Resolved Alerts</span>
          <strong>10%</strong>
        </div>
      </div>
    </div>
  </>
)}

  
  {activePage === "Settings" && (

  <div className="settings-container">
    <h2 className="settings-title">Workspace Settings</h2>

<div className="settings-grid">

  {/* Profile */}
  <div className="settings-card">
    <h3>👤 Profile Information</h3>

    <div className="input-group">
      <label>Full Name</label>
      <input type="text" placeholder="Admin Name" />
    </div>

    <div className="input-group">
      <label>Email Address</label>
      <input type="email" placeholder="admin@mailnova.com" />
    </div>

    <div className="input-group">
      <label>Phone Number</label>
      <input type="text" placeholder="+91 XXXXX XXXXX" />
    </div>

    <button className="save-btn">
      Save Profile
    </button>
  </div>

  {/* Security */}
  <div className="settings-card">
    <h3>🔒 Security & Access</h3>

    <div className="input-group">
      <label>Current Password</label>
      <input type="password" />
    </div>

    <div className="input-group">
      <label>New Password</label>
      <input type="password" />
    </div>

    <button className="save-btn">
      Update Password
    </button>
  </div>

  <div className="settings-card">
    <h3>Role-based Access</h3>
    <div className="role-grid">
      {[
        ["Admin", "Full control over campaigns, contacts, automations, billing, and settings."],
        ["Manager", "Can build campaigns, manage contacts, templates, and analytics exports."],
        ["Viewer", "Read-only access for reports, notifications, and executive dashboards."],
      ].map(([role, detail]) => (
        <div className="role-card" key={role}>
          <strong>{role}</strong>
          <p>{detail}</p>
        </div>
      ))}
    </div>
  </div>

  <div className="settings-card">
    <h3>Production Readiness</h3>
    <div className="readiness-list">
      <span>JWT authentication enabled</span>
      <span>Campaign send rate limits configured</span>
      <span>Backend validation and centralized errors</span>
      <span>Activity logs for key actions</span>
      <span>Queue-ready email delivery architecture</span>
    </div>
  </div>
 </div>

</div>
)}


  {/* DASHBOARD */}
  {activePage === "Dashboard" && (
    <>
        <div className="page-hero compact-hero">
          <div>
            <span className="eyebrow">MailNova Pro</span>
            <h1>Campaign Operations Dashboard</h1>
            <p>
              A focused command center for delivery performance, audience growth, automation, and platform health.
            </p>
          </div>
          <button type="button" className="compose-btn" onClick={openCampaignWizard}>
            Create Campaign
          </button>
        </div>

        <QuickActionCards
          setActivePage={setActivePage}
          openCompose={openCampaignWizard}
          openAddContact={openAddContact}
        />

        <StatsCards stats={dashboardData?.stats} />



        <div className="charts">
          <PerformanceChart data={dashboardData?.performance} />
          <ChannelChart />
        </div>

        {/* Progress first */}
        <ProgressSection />

        {/* Analytics below progress */}
        <AnalyticsCards />

        {/* TOP + ACTIVITY */}
        <div className="top-recent-wrapper">

          <TopPerformers
            campaigns={topCampaigns}
            showAll={showAllTopCampaigns}
            onViewAll={() => setShowAllTopCampaigns((current) => !current)}
          />

          <div className="chart-box">

            <div className="section-header">

              <h3>Recent Activity</h3>

              <a href="#">
                View all
              </a>

            </div>

                            {visibleActivities.map(
              (item, i) => (
                <div
                  className="activity-row"
                  key={i}
                >
                  <div className="activity-main">
                    <span
                      style={{
                        fontSize:
                          "18px",
                        color:
                          item.color,
                      }}
                    >
                      {item.icon}
                    </span>

                    <span>
                      {item.text}
                    </span>
                  </div>

                  <span className="activity-time">
                    {item.time}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="growth-usage-wrapper">
          <ContactGrowth />
          <EmailUsage usage={dashboardData?.emailUsage} />
        </div>

        <div className="bottom-wrapper">
          <Notifications
            theme={darkMode}
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onMarkAllRead={handleMarkAllNotificationsRead}
          />
          <Schedule />
        </div>

        <div className="last-wrapper">
  <Footer />
</div>

    </>
  )}

      </div>
    </div>
  );
}

export default AdminDashboard;
