export default function Placeholder({ tab, sub }) {
  return (
    <section>
      <h1 className="section-title">{tab.label}</h1>
      <div className="placeholder">
        <p className="placeholder-title">{sub.label}</p>
        <p>Esta tela ainda não foi construída.</p>
        <p className="muted">Quando conectarmos o Notion, ela vai ler o banco “{tab.db}”.</p>
      </div>
    </section>
  );
}
