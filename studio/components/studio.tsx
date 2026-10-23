"use client";
import { useState } from "react";
import {
  BookOpen,
  UsersRound,
  ScrollText,
  MapPin,
  Hourglass,
  Network,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Menu,
  Feather,
  Moon,
  Library,
  Search,
} from "lucide-react";
import {
  initialCharacters,
  sections,
  type Character,
  type Section,
} from "../lib/characters";
import { CharacterGallery } from "./character-gallery";
import { CharacterDialog } from "./character-dialog";
import { Relationships } from "./relationships";
const icons = [
  Library,
  UsersRound,
  ScrollText,
  MapPin,
  Hourglass,
  Network,
  Sparkles,
];
export function Studio() {
  const [section, setSection] = useState<Section>("Personagens");
  const [characters, setCharacters] = useState(initialCharacters);
  const [selected, setSelected] = useState<Character | null>(null);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = (next: Section) => {
    setSection(next);
    setMenu(false);
    setQuery("");
  };
  const save = (character: Character) => {
    setCharacters((current) =>
      current.some((c) => c.id === character.id)
        ? current.map((c) => (c.id === character.id ? character : c))
        : [...current, character],
    );
    setSelected(null);
  };
  return (
    <div className="studio-shell">
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("Portal")}
          aria-label="Ir ao portal Euphoriya"
        >
          <span className="brand-symbol">
            <Sparkles size={25} strokeWidth={1} />
          </span>
          <span>
            EUPHORIYA<small>STUDIO</small>
          </span>
        </button>
        <div className="universe-label">
          <span className="status-dot" /> UNIVERSO AUTORAL{" "}
          <ChevronRight size={12} />
        </div>
        <p className="nav-caption">O SEU ARQUIVO</p>
        <nav aria-label="Navegação principal">
          {sections.map((item, index) => {
            const Icon = icons[index];
            return (
              <button
                key={item}
                onClick={() => navigate(item)}
                className={`nav-item ${section === item ? "active" : ""}`}
                aria-current={section === item ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.4} />
                <span>{item}</span>
                {item === "Personagens" && (
                  <small>{characters.length.toString().padStart(2, "0")}</small>
                )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="quote-mark">“</div>
          <p>
            Todo universo começa
            <br />
            com uma história.
            <br />
            <em>Esta é a sua.</em>
          </p>
          <Sparkles
            className="tiny-star"
            size={19}
            strokeWidth={1}
            aria-hidden="true"
          />
          <div className="local-badge">
            <span className="status-dot" /> Espaço de criação pessoal
          </div>
          <small>VERSÃO DEMONSTRATIVA · 0.1</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Abrir navegação"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span>Seu universo</span>
            <ChevronRight size={12} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-indicator">
              <span /> MODO EXPLORAÇÃO
            </span>
            <span className="avatar">A</span>
          </div>
        </header>
        <main>
          {section === "Portal" ? (
            <section className="portal">
              <div className="eyebrow">
                UM UNIVERSO À ESPERA DE SUAS PALAVRAS
              </div>
              <h1>EUPHORIYA</h1>
              <p>Há histórias que não cabem em um só mundo.</p>
              <button
                className="primary-button"
                onClick={() => navigate("Biblioteca")}
              >
                Abrir a biblioteca <ArrowUpRight size={17} />
              </button>
            </section>
          ) : (
            <>
              <section className="hero">
                <div className="hero-content">
                  <div className="eyebrow">
                    <span /> ARQUIVO DE UM UNIVERSO
                  </div>
                  <h1>
                    Onde suas histórias
                    <br />
                    ganham <em>eternidade.</em>
                  </h1>
                  <p>
                    Cada vida, cada lugar, cada laço.
                    <br />
                    Os fragmentos de um mundo que só você pode criar.
                  </p>
                  <div className="hero-signature">
                    <span /> EUPHORIYA STUDIO <span />
                  </div>
                </div>
                <div className="hero-number">
                  VOL. I <span>O início de tudo</span>
                </div>
              </section>
              <div className="content-area">
                {section === "Personagens" ? (
                  <CharacterGallery
                    characters={characters}
                    onOpen={setSelected}
                    onFavorite={(id) =>
                      setCharacters((current) =>
                        current.map((c) =>
                          c.id === id ? { ...c, favorite: !c.favorite } : c,
                        ),
                      )
                    }
                    onCreate={() =>
                      setSelected({
                        id: crypto.randomUUID(),
                        name: "",
                        portrait: -1,
                        biography: "",
                        appearance: "",
                        origin: "",
                        species: "",
                        favorite: false,
                      })
                    }
                  />
                ) : section === "Relações" ? (
                  <Relationships characters={characters} onOpen={setSelected} />
                ) : section === "Biblioteca" ? (
                  <>
                    <div className="section-heading">
                      <div>
                        <div className="eyebrow">O ACERVO</div>
                        <h2>Sua biblioteca</h2>
                        <p>Um lugar para cada fragmento do seu universo.</p>
                      </div>
                      <BookOpen
                        className="heading-decoration"
                        size={38}
                        strokeWidth={1}
                      />
                    </div>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar no acervo..."
                        aria-label="Buscar no acervo"
                      />
                    </label>
                    <div className="collection-grid">
                      {sections
                        .slice(1)
                        .filter((s) =>
                          s.toLowerCase().includes(query.toLowerCase()),
                        )
                        .map((s, i) => {
                          const Icon = icons[i + 1];
                          return (
                            <button
                              className="collection-card"
                              key={s}
                              onClick={() => navigate(s)}
                            >
                              <Icon size={27} strokeWidth={1} />
                              <h3>{s}</h3>
                              <p>
                                {s === "Personagens"
                                  ? `${characters.length} vidas para descobrir`
                                  : s === "Relações"
                                    ? "4 laços familiares registrados"
                                    : "Um capítulo à espera de palavras"}
                              </p>
                              <ArrowUpRight size={18} />
                            </button>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <ArchiveSection key={section} section={section} />
                )}
              </div>
              <footer>
                <span>
                  <Sparkles size={12} /> Feito de histórias. Guardado com
                  propósito.
                </span>
                <span>
                  EUPHORIYA <span className="footer-dot">·</span> UM UNIVERSO EM
                  CONSTRUÇÃO
                </span>
              </footer>
            </>
          )}
        </main>
      </div>
      {selected && (
        <CharacterDialog
          character={selected}
          characters={characters}
          onClose={() => setSelected(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
function ArchiveSection({ section }: { section: string }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <section key={section}>
      <div className="section-heading">
        <div>
          <div className="eyebrow">FRAGMENTOS DO UNIVERSO</div>
          <h2>{section}</h2>
          <p>Espaço de experimentação. Nenhum fato canônico registrado.</p>
        </div>
        <Feather size={32} strokeWidth={1} />
      </div>
      <div className="draft-panel">
        <Moon size={25} strokeWidth={1} />
        <h3>O próximo capítulo começa aqui.</h3>
        <p>Escreva uma ideia para explorar durante esta sessão.</p>
        <label className="sr-only" htmlFor="draft">
          Rascunho de {section}
        </label>
        <textarea
          id="draft"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSaved(false);
          }}
          placeholder="Era uma vez um fragmento de universo..."
        />
        <button
          className="secondary-button"
          disabled={!text.trim()}
          onClick={() => setSaved(true)}
        >
          Guardar rascunho
        </button>
        <small role="status">
          {saved
            ? "Rascunho guardado nesta tela. Não persiste ao sair ou recarregar."
            : "Dados demonstrativos · rascunho temporário"}
        </small>
      </div>
    </section>
  );
}
