"use client";

import { diffDays, shiftISO, todayISO } from "../lib/dates";

const sd = (iso) => iso.split("-").reverse().slice(0, 2).join("/");

// Cronograma: marcos como losangos, tarefas como barras de início a prazo.
export default function ProjectGantt({ milestones, tasks, project, onOpen }) {
  const dates = [project.due, ...milestones.map((m) => m.due), ...tasks.flatMap((t) => [t.start, t.due])].filter(Boolean).sort();
  if (!dates.length) return <p className="empty">Defina datas nas tarefas e nos marcos para ver o cronograma.</p>;

  const min = shiftISO(dates[0], -2);
  const max = shiftISO(dates[dates.length - 1], 2);
  const span = diffDays(max, min) + 1;
  const pos = (iso) => (diffDays(iso, min) / span) * 100;
  const today = todayISO();
  const showToday = today >= min && today <= max;
  const ticks = [];
  for (let i = 0; i < span; i += 7) ticks.push(shiftISO(min, i));

  const Track = ({ children }) => (
    <div className="g-track" style={{ backgroundSize: `${700 / span}% 100%` }}>
      {showToday && <i className="g-today" style={{ left: `${pos(today)}%` }} />}
      {children}
    </div>
  );

  const groups = [...milestones, { id: "", title: "Sem marco", due: null, done: false }];

  return (
    <div className="gantt">
      <div className="gantt-inner">
        <div className="g-row g-axis">
          <div className="g-label" />
          <div className="g-track">{ticks.map((t) => <span key={t} className="g-tick" style={{ left: `${pos(t)}%` }}>{sd(t)}</span>)}</div>
        </div>

        {groups.map((g) => {
          const items = tasks.filter((t) => (t.milestone || "") === g.id);
          if (g.id === "" && items.length === 0) return null;
          return (
            <div key={g.id || "none"}>
              <div className="g-row g-group">
                <div className="g-label"><strong>{g.title}</strong></div>
                <Track>
                  {g.due && <span className={"g-diamond" + (g.done ? " on" : "")} style={{ left: `${pos(g.due)}%` }} title={`${g.title} · ${sd(g.due)}`} />}
                </Track>
              </div>
              {items.map((t) => {
                const a = t.start || t.due;
                const b = t.due || t.start;
                const [s, e] = a && b ? [a, b].sort() : [null, null];
                return (
                  <div key={t.id} className="g-row">
                    <div className="g-label"><button className="g-name" onClick={() => onOpen(t.id)}>{t.title}</button></div>
                    <Track>
                      {s ? (
                        <button
                          className={`g-bar g-${t.status}`}
                          style={{ left: `${pos(s)}%`, width: `${Math.max(((diffDays(e, s) + 1) / span) * 100, 1.2)}%` }}
                          onClick={() => onOpen(t.id)}
                          title={`${t.title} (${sd(s)} → ${sd(e)})`}
                          aria-label={`${t.title}, de ${sd(s)} a ${sd(e)}`}
                        />
                      ) : (
                        <span className="muted small g-nodate">sem datas</span>
                      )}
                    </Track>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
