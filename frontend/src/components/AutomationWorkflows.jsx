import { useMemo, useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaEnvelope,
  FaFilter,
  FaLayerGroup,
  FaPauseCircle,
  FaPlayCircle,
  FaPlus,
  FaProjectDiagram,
  FaUsers,
} from "react-icons/fa";

const starterWorkflows = [
  {
    id: "welcome",
    name: "Welcome Journey",
    trigger: "New contact added",
    condition: "Status is Lead",
    action: "Send welcome email",
    folder: "All Contacts",
    active: true,
    runs: 248,
    conversion: 18,
  },
  {
    id: "follow-up",
    name: "Non-opener Follow-up",
    trigger: "Campaign not opened",
    condition: "Wait 48 hours",
    action: "Send follow-up campaign",
    folder: "Re-engagement",
    active: true,
    runs: 112,
    conversion: 11,
  },
  {
    id: "interest",
    name: "Interested Buyer Routing",
    trigger: "Clicked link",
    condition: "Clicked pricing or demo CTA",
    action: "Move to interested folder",
    folder: "Enterprise Leads",
    active: false,
    runs: 68,
    conversion: 27,
  },
];

const triggerOptions = ["New contact added", "Campaign not opened", "Clicked link", "Contact becomes inactive"];
const conditionOptions = ["Immediately", "Wait 24 hours", "Wait 48 hours", "Status is Lead", "High engagement"];
const actionOptions = ["Send welcome email", "Send follow-up campaign", "Move to interested folder", "Notify manager"];

function AutomationWorkflows({ contactLists = [], setActivePage, showToast }) {
  const [workflows, setWorkflows] = useState(starterWorkflows);
  const [draft, setDraft] = useState({
    name: "New client journey",
    trigger: triggerOptions[0],
    condition: conditionOptions[0],
    action: actionOptions[0],
    folder: "",
  });

  const activeCount = workflows.filter((workflow) => workflow.active).length;
  const totalRuns = workflows.reduce((sum, workflow) => sum + workflow.runs, 0);
  const averageConversion = workflows.length
    ? Math.round(workflows.reduce((sum, workflow) => sum + workflow.conversion, 0) / workflows.length)
    : 0;

  const recommendedWorkflow = useMemo(() => {
    if (!contactLists.length) return "Create a welcome journey after your first folder is ready.";
    const largest = [...contactLists].sort(
      (a, b) => (b.contactCount || b.contacts?.length || 0) - (a.contactCount || a.contacts?.length || 0)
    )[0];
    return `Build a follow-up workflow for ${largest.name} because it has the largest reachable audience.`;
  }, [contactLists]);

  const createWorkflow = () => {
    if (!draft.name.trim()) {
      showToast?.("Workflow name required", "Give the automation a clear client-facing name.", "warning");
      return;
    }

    const workflow = {
      id: `${draft.name}-${Date.now()}`,
      ...draft,
      folder: draft.folder || "All Contacts",
      active: true,
      runs: 0,
      conversion: 0,
    };

    setWorkflows((current) => [workflow, ...current]);
    setDraft({
      name: "New client journey",
      trigger: triggerOptions[0],
      condition: conditionOptions[0],
      action: actionOptions[0],
      folder: "",
    });
    showToast?.("Workflow created", "The automation is now visible in the workflow board.", "success");
  };

  const toggleWorkflow = (id) => {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === id ? { ...workflow, active: !workflow.active } : workflow
      )
    );
  };

  return (
    <section className="automation-command">
      <div className="page-hero compact-hero">
        <div>
          <span className="eyebrow">Automation Studio</span>
          <h1>Visual workflow builder</h1>
          <p>
            Create client-ready journeys such as welcome emails, non-opener follow-ups, and interested-buyer routing.
          </p>
        </div>
        <button type="button" className="compose-btn" onClick={() => setActivePage("Campaigns")}>
          Create Campaign
        </button>
      </div>

      <div className="automation-kpis">
        <div>
          <FaProjectDiagram />
          <strong>{workflows.length}</strong>
          <span>Total workflows</span>
        </div>
        <div>
          <FaPlayCircle />
          <strong>{activeCount}</strong>
          <span>Active journeys</span>
        </div>
        <div>
          <FaBolt />
          <strong>{totalRuns.toLocaleString()}</strong>
          <span>Automation runs</span>
        </div>
        <div>
          <FaCheckCircle />
          <strong>{averageConversion}%</strong>
          <span>Avg conversion</span>
        </div>
      </div>

      <div className="automation-builder-grid">
        <div className="automation-builder chart-box">
          <div className="section-header">
            <div>
              <h3>Build Workflow</h3>
              <p>Trigger &gt; Condition &gt; Action</p>
            </div>
            <FaPlus />
          </div>

          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Workflow name"
          />
          <select value={draft.trigger} onChange={(event) => setDraft((current) => ({ ...current, trigger: event.target.value }))}>
            {triggerOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={draft.condition} onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value }))}>
            {conditionOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value }))}>
            {actionOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select value={draft.folder} onChange={(event) => setDraft((current) => ({ ...current, folder: event.target.value }))}>
            <option value="">All Contacts</option>
            {contactLists.map((list) => (
              <option key={list._id} value={list.name}>
                {list.name}
              </option>
            ))}
          </select>
          <button type="button" className="compose-btn" onClick={createWorkflow}>
            Create Workflow
          </button>
        </div>

        <div className="workflow-recommendation chart-box">
          <span>
            <FaFilter />
          </span>
          <h3>Workflow Recommendation</h3>
          <p>{recommendedWorkflow}</p>
          <button type="button" className="template-btn" onClick={() => setActivePage("Contacts")}>
            Review Segments
          </button>
        </div>
      </div>

      <div className="workflow-board">
        {workflows.map((workflow) => (
          <article className="workflow-card" key={workflow.id}>
            <div className="workflow-card-header">
              <div>
                <strong>{workflow.name}</strong>
                <span className={workflow.active ? "status-badge" : "status-badge paused"}>
                  {workflow.active ? "Active" : "Paused"}
                </span>
              </div>
              <button type="button" onClick={() => toggleWorkflow(workflow.id)} aria-label="Toggle workflow">
                {workflow.active ? <FaPauseCircle /> : <FaPlayCircle />}
              </button>
            </div>

            <div className="workflow-line">
              <div>
                <FaUsers />
                <span>{workflow.trigger}</span>
              </div>
              <div>
                <FaLayerGroup />
                <span>{workflow.condition}</span>
              </div>
              <div>
                <FaEnvelope />
                <span>{workflow.action}</span>
              </div>
            </div>

            <div className="workflow-card-footer">
              <span>{workflow.folder}</span>
              <strong>{workflow.runs.toLocaleString()} runs</strong>
              <strong>{workflow.conversion}% conversion</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AutomationWorkflows;
