import { useEffect, useRef, useState } from "react";
import World from "./scene/World";
import { useActivity } from "./activity/useActivity";
import { activity } from "./activity/store";
import { states, labels, messages, type ByteState } from "./activity/protocol";
import { Icon, type IconName } from "./Icon";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./preferences";
const icons: Record<ByteState, IconName> = {
  idle: "idle",
  thinking: "think",
  coding: "code",
  debugging: "bug",
  success: "check",
  break: "coffee",
};
function Avatar({ small = false }: { small?: boolean }) {
  return (
    <span className={`avatar ${small ? "small" : ""}`} aria-hidden="true">
      <i />
      <b />
      <em />
    </span>
  );
}
function App() {
  const a = useActivity(),
    [prefs, setPrefs] = useState(loadPreferences),
    [tab, setTab] = useState<"office" | "activity">("office"),
    [cinema, setCinema] = useState(false),
    [reset, setReset] = useState(0),
    [zoom, setZoom] = useState(0),
    [bubble, setBubble] = useState(false),
    [settings, setSettings] = useState(false),
    [connect, setConnect] = useState(false),
    [time, setTime] = useState(new Date());
  const dialogRef = useRef<HTMLElement>(null),
    dialogTrigger = useRef<HTMLElement | null>(null);
  function toggle(key: keyof Preferences) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }
  function demo(state: ByteState) {
    activity.apply({ state }, "demo");
    setBubble(true);
  }
  useEffect(() => savePreferences(prefs), [prefs]);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!bubble) return;
    const t = setTimeout(() => setBubble(false), 6500);
    return () => clearTimeout(t);
  }, [bubble, a.state]);
  useEffect(() => {
    if (!prefs.auto || a.source === "external") return;
    const t = setInterval(() => {
      const current = activity.getSnapshot();
      const index = states.indexOf(current.state);
      activity.apply({ state: states[(index + 1) % states.length] }, "demo");
    }, 11000);
    return () => clearInterval(t);
  }, [prefs.auto, a.source]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCinema(false);
        setSettings(false);
        setConnect(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (!settings && !connect) return;
    dialogTrigger.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex="0"]',
      );
      if (!buttons?.length) return;
      const first = buttons[0],
        last = buttons[buttons.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      dialogTrigger.current?.focus();
    };
  }, [settings, connect]);
  const localTime = time.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <div
      className={`app ${cinema ? "cinematic" : ""} ${prefs.night ? "night" : "day"}`}
    >
      <header className="header chrome">
        <a className="brand" href="./" aria-label="BYTE HQ, inicio">
          <span className="brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <strong>
            BYTE<span>HQ</span>
          </strong>
          <span className="brand-divider" />
          <span className="edition">TU OFICINA VIRTUAL</span>
        </a>
        <nav aria-label="Navegación principal">
          <button
            className={tab === "office" ? "active" : ""}
            onClick={() => setTab("office")}
          >
            <Icon name="office" />
            La oficina
          </button>
          <button
            className={tab === "activity" ? "active" : ""}
            onClick={() => setTab("activity")}
          >
            <Icon name="activity" />
            Actividad
            <span className="nav-dot" />
          </button>
        </nav>
        <div className="header-right">
          <span className="system">
            <i /> Todos los sistemas en calma
          </span>
          <button
            className="icon-button"
            title="Preferencias"
            aria-label="Preferencias"
            onClick={() => setSettings(true)}
          >
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <main>
        <aside className="sidebar chrome">
          <div className="intro">
            <div className="eyebrow">
              <span /> UN PEQUEÑO MUNDO, GRANDES IDEAS
            </div>
            <h1>
              Hay un lugar
              <br />
              para tus <span>ideas.</span>
            </h1>
            <p>
              Y alguien que siempre está
              <br />
              listo para darles vida.
            </p>
          </div>
          <section className="byte-card" aria-label="Estado de BYTE">
            <div className="byte-heading">
              <Avatar />
              <div>
                <strong>BYTE</strong>
                <span>Tu compañero de ideas</span>
              </div>
              <span className="online-dot" />
            </div>
            <div className={`status-line ${a.state}`}>
              <span className="state-icon">
                <Icon name={icons[a.state]} />
              </span>
              <div>
                <strong>{labels[a.state]}</strong>
                <span>
                  {a.source === "demo"
                    ? "Explorando en modo demostración"
                    : "Actividad de un agente externo"}
                </span>
              </div>
              <span className="bars">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="quote">“{a.message}”</div>
            <div className="card-footer">
              <span className={`mode-pill ${a.source}`}>
                {a.source === "demo" ? "SIMULACIÓN" : "EVENTO REAL"}
              </span>
              <span>
                <Icon name="check" size={13} />
                {a.completed} tareas reales
              </span>
            </div>
          </section>
          <section className="demo-section">
            <div className="section-label">
              DALE ALGO QUE HACER <span>DEMO</span>
            </div>
            <div className="state-grid">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => demo(state)}
                  className={a.state === state ? "selected" : ""}
                  aria-pressed={a.state === state}
                >
                  <Icon name={icons[state]} />
                  <span>{labels[state]}</span>
                  {a.state === state && <i />}
                </button>
              ))}
            </div>
            <label className="auto-control">
              <span>
                <Icon name="play" size={14} /> Alternar estados automáticamente
              </span>
              <input
                aria-label="Alternar estados automáticamente"
                type="checkbox"
                checked={prefs.auto}
                onChange={() => toggle("auto")}
              />
              <span className="switch" />
            </label>
          </section>
          <button className="connect-card" onClick={() => setConnect(true)}>
            <span className="connect-icon">
              <Icon name="link" />
            </span>
            <span>
              <strong>Conecta tu mundo real</strong>
              <small>
                {a.connected
                  ? "Adaptador local conectado"
                  : "Vincula tu agente con BYTE"}
              </small>
            </span>
            <Icon name="chevron" size={15} />
          </button>
          <div className="sidebar-note">
            <span>✧</span>
            <p>
              Las grandes cosas empiezan
              <br />
              en pequeños espacios.
            </p>
          </div>
        </aside>
        <section
          className="stage"
          aria-label="Oficina tridimensional interactiva de BYTE"
        >
          <div className="stage-top chrome">
            <div className="room-label">
              <span className="room-number">01</span>
              <div>
                <strong>El rincón de BYTE</strong>
                <span>Un poco de código. Un poco de calma.</span>
              </div>
            </div>
            <div className="weather">
              <Icon name={prefs.night ? "moon" : "sun"} size={16} />
              <span>{prefs.night ? "Noche tranquila" : "Un nuevo día"}</span>
              <i />
              <time>{localTime}</time>
            </div>
          </div>
          <div className="scene">
            <World
              state={a.state}
              {...prefs}
              cinematic={cinema}
              reset={reset}
              zoom={zoom}
              onByte={() => setBubble((b) => !b)}
              onMonitor={() => setTab("activity")}
              onLamp={() => toggle("lamp")}
              onWindow={() => toggle("night")}
            />
          </div>
          {bubble && (
            <div className="speech" role="status">
              <Avatar small />
              <span>{messages[a.state]}</span>
              <button
                aria-label="Cerrar diálogo"
                onClick={() => setBubble(false)}
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          )}
          <div className="stage-hint chrome">
            <span className="tiny-dot" /> ESTÁS EN CASA{" "}
            <span className="hint-rule" /> Arrastra para explorar · Haz clic
            para descubrir
          </div>
          <div className="scene-controls chrome">
            <div className="control-group">
              <button
                title="Acercar"
                aria-label="Acercar cámara"
                disabled={zoom >= 4}
                onClick={() => setZoom((z) => Math.min(4, z + 1))}
              >
                <Icon name="plus" />
              </button>
              <button
                title="Alejar"
                aria-label="Alejar cámara"
                disabled={zoom <= -3}
                onClick={() => setZoom((z) => Math.max(-3, z - 1))}
              >
                <Icon name="minus" />
              </button>
              <span />
              <button
                title="Restablecer vista"
                aria-label="Restablecer vista"
                onClick={() => {
                  setZoom(0);
                  setReset((r) => r + 1);
                }}
              >
                <Icon name="reset" size={16} />
              </button>
            </div>
          </div>
          <div className="toolbar chrome">
            <div className="toolbar-group">
              <button
                className={prefs.night ? "enabled" : ""}
                aria-label="Alternar día y noche"
                aria-pressed={prefs.night}
                onClick={() => toggle("night")}
              >
                <Icon name={prefs.night ? "moon" : "sun"} />
                <span>{prefs.night ? "Noche" : "Día"}</span>
              </button>
              <button
                className={prefs.rain ? "enabled" : ""}
                aria-label="Alternar lluvia"
                aria-pressed={prefs.rain}
                onClick={() => toggle("rain")}
              >
                <Icon name="rain" />
                <span>Lluvia</span>
                <i className={prefs.rain ? "on" : ""} />
              </button>
              <button
                className={prefs.lamp ? "enabled" : ""}
                aria-label="Alternar lámpara"
                aria-pressed={prefs.lamp}
                onClick={() => toggle("lamp")}
              >
                <Icon name="lamp" />
                <span>Lámpara</span>
                <i className={prefs.lamp ? "on" : ""} />
              </button>
            </div>
            <span className="toolbar-divider" />
            <button className="cinema-button" onClick={() => setCinema(true)}>
              <Icon name="expand" size={16} />
              <span>Modo cine</span>
            </button>
          </div>
          <div className="world-caption chrome">
            <span>HECHO DE PÍXELES Y POSIBILIDADES</span>
            <span>✦</span>
          </div>
          {tab === "activity" && (
            <section
              className="activity-panel chrome"
              aria-label="Actividad de BYTE"
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">DENTRO DE SU PEQUEÑO MUNDO</span>
                  <h2>Lo que está pasando</h2>
                </div>
                <button
                  className="icon-button"
                  aria-label="Cerrar actividad"
                  onClick={() => setTab("office")}
                >
                  <Icon name="close" />
                </button>
              </div>
              <div className="connection-line">
                <i className={a.connected ? "online-dot" : ""} />
                {a.connected
                  ? "Adaptador conectado · esperando tus eventos"
                  : "Sin conexión al adaptador local"}
              </div>
              <p className="activity-disclaimer">
                Solo los eventos externos representan trabajo real. Las acciones
                manuales se identifican como simulación.
              </p>
              <div className="event-list">
                {a.history.length ? (
                  a.history.map((entry) => (
                    <article key={entry.key}>
                      <span className={`event-icon ${entry.state}`}>
                        <Icon name={icons[entry.state]} />
                      </span>
                      <div>
                        <strong>{labels[entry.state]}</strong>
                        <p>{entry.message}</p>
                        <small>
                          {entry.source === "demo"
                            ? "SIMULACIÓN"
                            : "EVENTO REAL"}{" "}
                          ·{" "}
                          {new Date(entry.time).toLocaleTimeString("es-MX", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </small>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty">
                    <Icon name="activity" size={28} />
                    <p>Todo está tranquilo por aquí.</p>
                    <span>Selecciona un estado o envía tu primer evento.</span>
                  </div>
                )}
              </div>
              <button className="text-button" onClick={() => setConnect(true)}>
                Cómo enviar actividad <Icon name="chevron" size={14} />
              </button>
            </section>
          )}
        </section>
      </main>
      <footer className="footer chrome">
        <span>
          <i className="tiny-dot" /> BYTE HQ{" "}
          <span className="footer-sep">/</span> Tu espacio para crear.
        </span>
        <span>
          Sin prisa. Con propósito. <span className="footer-star">✧</span>
          <button onClick={() => setConnect(true)}>
            <Icon name="info" size={13} /> Acerca del proyecto
          </button>
          <span className="version">v0.1</span>
        </span>
      </footer>
      {cinema && (
        <button className="exit-cinema" onClick={() => setCinema(false)}>
          <Icon name="expand" size={16} /> Salir del modo cine <kbd>ESC</kbd>
        </button>
      )}
      {(settings || connect) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSettings(false);
            setConnect(false);
          }}
        >
          <section
            ref={dialogRef}
            tabIndex={-1}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <span className="eyebrow">
                BYTE HQ / {settings ? "A TU MANERA" : "MUNDO CONECTADO"}
              </span>
              <button
                className="icon-button"
                aria-label="Cerrar"
                onClick={() => {
                  setSettings(false);
                  setConnect(false);
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2 id="dialog-title">
              {settings
                ? "Los pequeños detalles."
                : "Dale vida con actividad real."}
            </h2>
            {settings ? (
              <>
                <p>
                  Tu rincón, a tu ritmo. Guardamos estas preferencias en este
                  navegador.
                </p>
                {(
                  [
                    {
                      key: "night",
                      label: "Ambiente nocturno",
                      note: "Luces cálidas para ideas de madrugada.",
                    },
                    {
                      key: "rain",
                      label: "Lluvia en la ventana",
                      note: "Una ciudad con un poquito más de calma.",
                    },
                    {
                      key: "lamp",
                      label: "Luz del escritorio",
                      note: "El brillo de una buena idea.",
                    },
                    {
                      key: "pixel",
                      label: "Acabado pixel art",
                      note: "Resolución reducida y bordes nítidos.",
                    },
                  ] as const
                ).map((p) => (
                  <label className="preference" key={p.key}>
                    <span>
                      <strong>{p.label}</strong>
                      <small>{p.note}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={prefs[p.key]}
                      onChange={() => toggle(p.key)}
                    />
                    <span className="switch" />
                  </label>
                ))}
              </>
            ) : (
              <>
                <p>
                  BYTE refleja los eventos que envía una integración autorizada.
                  No tiene acceso a estados internos de ChatGPT o Codex.
                </p>
                <div className="integration-status">
                  <span className={a.connected ? "online-dot" : "tiny-dot"} />
                  {a.connected
                    ? "Adaptador local conectado"
                    : "Inicia el proyecto con npm run dev"}
                </div>
                <p>Desde tu agente local, envía un evento JSON por HTTP:</p>
                <pre>
                  <code>{`POST http://127.0.0.1:8787/event\nContent-Type: application/json\n\n{\n  "id": "tarea-001",\n  "state": "coding",\n  "message": "Construyendo una idea..."\n}`}</code>
                </pre>
                <p>
                  O publica el mismo JSON por WebSocket en{" "}
                  <code>ws://127.0.0.1:8787/events</code>. Consulta el README
                  para el ejemplo de PowerShell.
                </p>
                <div className="integration-note">
                  <Icon name="info" />
                  <span>
                    Sin eventos externos, estás en modo demostración. El
                    contador solo aumenta con eventos reales de éxito.
                  </span>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
export default App;
