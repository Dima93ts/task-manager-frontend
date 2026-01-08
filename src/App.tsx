import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import { Task } from "./types";


const API_URL = "https://task-manager-api-2-8pjn.onrender.com/api/tasks";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT");
}

function getStatusLabel(status: string) {
  if (status === "in_progress") return "in corso";
  if (status === "done") return "completato";
  return "da fare";
}

function getStatusClass(status: string) {
  if (status === "in_progress") return "status-chip status-in-progress";
  if (status === "done") return "status-chip status-done";
  return "status-chip status-todo";
}

const initialNewTask = {
  clientName: "",
  projectName: "",
  title: "",
  description: "",
  priority: "medium",
  estimatedHours: 1,
  dueDate: "",
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [newTask, setNewTask] = useState(initialNewTask);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    axios
      .get<Task[]>(API_URL)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markAsDone = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === "done") return;

    const updatedTask: Task = { ...task, status: "done" };

    axios
      .put(`${API_URL}/${taskId}`, updatedTask)
      .then(() => {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      })
      .catch((err) => console.error(err));
  };

  const deleteTask = (taskId: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo task?"))
      return;

    axios
      .delete(`${API_URL}/${taskId}`)
      .then(() => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      })
      .catch((err) => console.error(err));
  };

  const visibleTasks = tasks
    .filter((t) =>
      statusFilter === "all" ? true : t.status === statusFilter
    )
    .filter((t) =>
      clientFilter === "all" ? true : t.clientName === clientFilter
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      ...newTask,
      status: "todo",
      estimatedHours: Number(newTask.estimatedHours),
      dueDate: newTask.dueDate
        ? new Date(newTask.dueDate).toISOString()
        : new Date().toISOString(),
    };

    axios
      .post<Task>(API_URL, body)
      .then((res) => {
        setTasks((prev) => [...prev, res.data]);
        setNewTask(initialNewTask);
      })
      .catch((err) => console.error(err));
  };

  const clientOptions = Array.from(
    new Set(tasks.map((t) => t.clientName))
  );

  // Dashboard stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const inProgressCount = tasks.filter(
    (t) => t.status === "in_progress"
  ).length;

  const hoursByClient = tasks.reduce(
    (acc, t) => {
      acc[t.clientName] = (acc[t.clientName] || 0) + t.estimatedHours;
      return acc;
    },
    {} as Record<string, number>
  );

  // Export PDF
  const exportPDF = async () => {
    const element = document.getElementById("export-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= 277;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= 277;
      }

      pdf.save("task-manager.pdf");
    } catch (err) {
      console.error(err);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = [
      "ID",
      "Cliente",
      "Progetto",
      "Titolo",
      "Stato",
      "Importanza",
      "Scadenza",
      "Ore",
    ];
    const rows = tasks.map((t) => [
      t.id,
      t.clientName,
      t.projectName,
      t.title,
      t.status,
      t.priority,
      formatDate(t.dueDate),
      t.estimatedHours,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "task-manager.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Analytics />
      {/* Header */}
      <div className="header">
        <h1>📋 Gestione Attività</h1>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title="Cambia tema"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={exportPDF} className="export-btn" title="Scarica PDF">
            📄 PDF
          </button>
          <button onClick={exportCSV} className="export-btn" title="Scarica CSV">
            📊 CSV
          </button>
        </div>
      </div>

      {/* Dashboard */}
      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Task Totali</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completionPercent}%</div>
          <div className="stat-label">Completamento</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completati</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inProgressCount}</div>
          <div className="stat-label">In Corso</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-label">Ore Stimate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(hoursByClient).length}</div>
          <div className="stat-label">Clienti</div>
        </div>
      </div>

      {/* Ore per cliente */}
      {Object.keys(hoursByClient).length > 0 && (
        <div className="hours-by-client">
          <h3>⏱️ Ore per Cliente</h3>
          <div className="client-list">
            {Object.entries(hoursByClient)
              .sort((a, b) => b[1] - a[1])
              .map(([client, hours]) => (
                <div key={client} className="client-item">
                  <span className="client-name">{client}</span>
                  <span className="hours-badge">{hours}h</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filtri */}
      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tutti gli stati</option>
          <option value="todo">Da fare</option>
          <option value="in_progress">In corso</option>
          <option value="done">Completati</option>
        </select>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tutti i clienti</option>
          {clientOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Form nuovo task */}
      <form onSubmit={handleCreate} className="task-form">
        <input
          required
          placeholder="Cliente"
          value={newTask.clientName}
          onChange={(e) =>
            setNewTask({ ...newTask, clientName: e.target.value })
          }
        />
        <input
          required
          placeholder="Progetto"
          value={newTask.projectName}
          onChange={(e) =>
            setNewTask({ ...newTask, projectName: e.target.value })
          }
        />
        <input
          required
          placeholder="Titolo attività"
          value={newTask.title}
          onChange={(e) =>
            setNewTask({ ...newTask, title: e.target.value })
          }
        />
        <input
          placeholder="Descrizione"
          value={newTask.description}
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
        />
        <select
          value={newTask.priority}
          onChange={(e) =>
            setNewTask({ ...newTask, priority: e.target.value })
          }
        >
          <option value="low">bassa</option>
          <option value="medium">media</option>
          <option value="high">alta</option>
        </select>
        <input
          type="number"
          min={1}
          placeholder="Ore stimate"
          value={newTask.estimatedHours}
          onChange={(e) =>
            setNewTask({
              ...newTask,
              estimatedHours: Number(e.target.value),
            })
          }
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) =>
            setNewTask({ ...newTask, dueDate: e.target.value })
          }
        />
        <button type="submit" className="add-task-btn">
          ➕ Aggiungi task
        </button>
      </form>

      {loading && <p className="loading">Caricamento...</p>}

      {/* Lista task */}
      <div id="export-content">
        {!loading && visibleTasks.length === 0 && (
          <p className="no-tasks">Nessun task trovato</p>
        )}

        {!loading &&
          visibleTasks.map((t) => (
            <div key={t.id} className="task-card">
              <div className="task-main">
                <div className="task-title">
                  {t.clientName} - {t.projectName}: {t.title}
                </div>
                <div className="task-meta">
                  Scadenza: {formatDate(t.dueDate)} • Importanza:{" "}
                  {t.priority} • {t.estimatedHours} h
                </div>
                <div className="task-meta">{t.description}</div>
              </div>

              <div className="task-actions">
                <span className={getStatusClass(t.status)}>
                  {getStatusLabel(t.status)}
                </span>
                <button
                  className="complete-btn"
                  onClick={() => markAsDone(t.id)}
                  disabled={t.status === "done"}
                >
                  {t.status === "done" ? "✓ Completato" : "Completa"}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTask(t.id)}
                  title="Elimina task"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
