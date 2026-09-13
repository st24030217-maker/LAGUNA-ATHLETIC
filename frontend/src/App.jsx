import "./App.css";
import Lanyard from "./components/Lanyard";

function App() {
  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get("embed") === "guardian";
  const cardName = params.get("name") || "Laguna Athletic";
  const cardNumber = params.get("number") || "10";
  const cardPosition = params.get("position") || "Jugador";
  const cardCategory = params.get("category") || "Sub-10";
  const cardStatus = params.get("status") || "Plantel Oficial";
  const cardStarter = params.get("starter") !== "false";
  const cardAttendance = params.get("attendance") || "0%";
  const cardGoals = params.get("goals") || "0";
  const cardAssists = params.get("assists") || "0";
  const cardMinutes = params.get("minutes") || "0'";
  const cardFolio = params.get("folio") || `LA-2026-${String(cardNumber).padStart(4, "0")}`;
  const cardTutor = params.get("tutor") || "Familia";
  const cardPhoto = params.get("photo") || "./LAGUNA.jpg";

  if (isEmbed) {
    return (
      <main className="embed-shell">
        <Lanyard
          position={[0, 0, 30]}
          gravity={[0, -40, 0]}
          fov={20}
          transparent
          lanyardImage="./lanyard-pattern.svg"
          lanyardWidth={1}
          cardName={cardName}
          cardNumber={cardNumber}
          cardPosition={cardPosition}
          cardCategory={cardCategory}
          cardStatus={cardStatus}
          cardStarter={cardStarter}
          cardAttendance={cardAttendance}
          cardGoals={cardGoals}
          cardAssists={cardAssists}
          cardMinutes={cardMinutes}
          cardFolio={cardFolio}
          cardTutor={cardTutor}
          cardPhoto={cardPhoto}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-overlay" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>Laguna Etletic</span>
        </div>
        <nav className="nav">
          <a href="#club">Club</a>
          <a href="#academy">Academy</a>
          <a href="#contact">Contacto</a>
        </nav>
      </header>

      <section className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Identity • Academy • Pride</p>
          <h1>La tarjeta del club, viva en movimiento.</h1>
          <p className="subtitle">
            Una experiencia visual premium para la identidad del equipo, con un
            toque técnico, dinámico y moderno.
          </p>

          <div className="cta-row">
            <button type="button" className="primary-btn">
              Ver identidad
            </button>
            <button type="button" className="secondary-btn">
              Contacto
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <Lanyard
            position={[0, 0, 30]}
            gravity={[0, -40, 0]}
            fov={20}
            transparent
            frontImage="/front-card.svg"
            backImage="/back-card.svg"
            lanyardImage="/lanyard-pattern.svg"
            lanyardWidth={1}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
