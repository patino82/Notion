import { notion, searchDatabaseIdByTitle, queryDatabase,
  getTitle, getDateStart, getPeopleNames, getSelect, getCheckbox, getRichText, getRelationIds } from "../notion";

export async function getServerSideProps() {
  const PROJECTS_TITLE = process.env.PROJECTS_TITLE || "Projects";
  const TASKS_TITLE = process.env.TASKS_TITLE || "Tasks";
  const LOGS_TITLE = process.env.LOGS_TITLE || "Daily Logs";

  const [projectsDb, tasksDb, logsDb] = await Promise.all([
    searchDatabaseIdByTitle(PROJECTS_TITLE),
    searchDatabaseIdByTitle(TASKS_TITLE),
    searchDatabaseIdByTitle(LOGS_TITLE)
  ]);

  const [projects, tasks, logs] = await Promise.all([
    queryDatabase(projectsDb),
    queryDatabase(tasksDb),
    queryDatabase(logsDb)
  ]);

  const projectsNorm = projects.map(p => ({
    id: p.id,
    name: getTitle(p, "Name"),
    status: getSelect(p, "Status"),
    budget: p.properties?.Budget?.number ?? null
  }));

  const tasksNorm = tasks.map(t => ({
    id: t.id,
    name: getTitle(t, "Name"),
    due: getDateStart(t, "Due Date"),
    status: getSelect(t, "Status"),
    priority: getSelect(t, "Priority"),
    type: getSelect(t, "Type"),
    assigned: getPeopleNames(t, "Assigned To"),
    completed: getCheckbox(t, "Completed"),
    projectIds: getRelationIds(t, "Project")
  }));

  const logsNorm = logs.map(l => ({
    id: l.id,
    date: getDateStart(l, "Date"),
    summary: getRichText(l, "Summary"),
    slot: getSelect(l, "Slot"),
    projectIds: getRelationIds(l, "Project")
  }));

  return { props: { projectsNorm, tasksNorm, logsNorm } };
}

export default function Home({ projectsNorm, tasksNorm, logsNorm }) {
  const openTasks = tasksNorm.filter(t => !t.completed);

  return (
    <main style={{ fontFamily: "system-ui", margin: 24 }}>
      <h1>Executive Suite Dashboard</h1>

      <section>
        <h2>Projects</h2>
        <table border="1" cellPadding="6">
          <thead><tr><th>Name</th><th>Status</th><th>Budget</th></tr></thead>
          <tbody>
            {projectsNorm.map(p => (
              <tr key={p.id}><td>{p.name}</td><td>{p.status}</td><td>{p.budget ?? ""}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Open Tasks</h2>
        <table border="1" cellPadding="6">
          <thead><tr><th>Name</th><th>Due</th><th>Status</th><th>Priority</th><th>Type</th><th>Assigned</th></tr></thead>
          <tbody>
            {openTasks.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td><td>{t.due || ""}</td><td>{t.status}</td>
                <td>{t.priority}</td><td>{t.type}</td><td>{t.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Daily Logs (Latest 20)</h2>
        <table border="1" cellPadding="6">
          <thead><tr><th>Date</th><th>Slot</th><th>Summary</th></tr></thead>
          <tbody>
            {logsNorm
              .sort((a,b) => (b.date || "").localeCompare(a.date || ""))
              .slice(0,20)
              .map(l => (
                <tr key={l.id}><td>{l.date || ""}</td><td>{l.slot}</td><td>{l.summary}</td></tr>
              ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
