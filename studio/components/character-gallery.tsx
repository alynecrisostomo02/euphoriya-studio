"use client";
import { useState } from "react";
import {
  Sparkles,
  Search,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpRight,
  Bookmark,
  UsersRound,
  X,
} from "lucide-react";
import type { Character } from "../lib/characters";
export function Portrait({
  character,
  className = "",
}: {
  character: Character;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Retrato ilustrativo, não canônico, de ${character.name || "novo personagem"}`}
      className={`portrait ${className} ${character.portrait < 0 ? "empty-portrait" : ""}`}
      style={
        character.portrait >= 0
          ? {
              backgroundImage: `url(/images/portrait-${character.portrait}.webp)`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
            }
          : undefined
      }
    >
      {character.portrait < 0 && <UsersRound size={48} strokeWidth={1} />}
    </div>
  );
}
interface Props {
  characters: Character[];
  onOpen: (character: Character) => void;
  onCreate: () => void;
  onFavorite: (id: string) => void;
}
export function CharacterGallery({
  characters,
  onOpen,
  onCreate,
  onFavorite,
}: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Todos os personagens");
  const [layout, setLayout] = useState("grid");
  const [filters, setFilters] = useState(false);
  const [sort, setSort] = useState("original");
  const [familyOnly, setFamilyOnly] = useState(false);
  const visible = characters
    .filter(
      (c) =>
        c.name
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR")) &&
        (tab !== "Favoritos" || c.favorite) &&
        (!familyOnly ||
          ["raffaell", "emilly", "lilith", "angelo", "lizzie"].includes(c.id)),
    )
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : 0));
  return (
    <section>
      <div className="section-heading">
        <div>
          <div className="eyebrow">AS ALMAS DESTE MUNDO</div>
          <h2>
            Character Studio{" "}
            <Sparkles
              className="title-star"
              size={23}
              strokeWidth={1}
              style={{ display: "inline" }}
              aria-hidden="true"
            />
          </h2>
          <p>Vidas que se entrelaçam. Histórias que merecem ser contadas.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={16} /> Novo personagem
        </button>
      </div>
      <div className="tabs">
        <button
          className={tab === "Todos os personagens" ? "selected" : ""}
          onClick={() => setTab("Todos os personagens")}
        >
          Todos os personagens{" "}
          <span>{characters.length.toString().padStart(2, "0")}</span>
        </button>
        <button
          className={tab === "Favoritos" ? "selected" : ""}
          onClick={() => setTab("Favoritos")}
        >
          <Bookmark size={14} /> Favoritos{" "}
          <span>
            {characters
              .filter((c) => c.favorite)
              .length.toString()
              .padStart(2, "0")}
          </span>
        </button>
        <div className="tabs-note">
          <span /> Coleção pessoal
        </div>
      </div>
      <div className="gallery-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Encontre um personagem..."
            aria-label="Encontre um personagem"
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Limpar busca"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <button
          className={`secondary-button ${filters ? "filter-active" : ""}`}
          aria-expanded={filters}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={15} /> Filtros{familyOnly && " · 1"}
        </button>
        <div className="view-switch">
          <button
            aria-label="Visualizar em grade"
            aria-pressed={layout === "grid"}
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            aria-label="Visualizar em lista"
            aria-pressed={layout === "list"}
            onClick={() => setLayout("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      {filters && (
        <div className="filter-panel">
          <label>
            <input
              type="checkbox"
              checked={familyOnly}
              onChange={(e) => setFamilyOnly(e.target.checked)}
            />{" "}
            Com laço familiar confirmado
          </label>
          <label>
            Ordenar{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="original">Ordem do acervo</option>
              <option value="name">Nome: A–Z</option>
            </select>
          </label>
        </div>
      )}
      <div className="results-line">
        <span>{visible.length} personagens no acervo</span>
        <span>RETRATOS ILUSTRATIVOS · NÃO CANÔNICOS</span>
      </div>
      <div className={`character-grid ${layout === "list" ? "list-view" : ""}`}>
        {visible.map((character, index) => (
          <article
            key={character.id}
            className="character-card"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <button
              className="card-open"
              onClick={() => onOpen(character)}
              aria-label={`Abrir perfil de ${character.name}`}
            >
              <div className="portrait-wrap">
                <Portrait character={character} />
                <div className="portrait-shade" />
                <span className="character-index">
                  Nº{" "}
                  {String(characters.indexOf(character) + 1).padStart(2, "0")}
                </span>
                <span className="card-tag">PERSONAGEM</span>
              </div>
              <div className="card-info">
                <div>
                  <h3>{character.name}</h3>
                  <p>{character.species || "Uma história a ser revelada"}</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1} />
              </div>
            </button>
            <button
              className={`favorite-button ${character.favorite ? "is-favorite" : ""}`}
              onClick={() => onFavorite(character.id)}
              aria-label={`${character.favorite ? "Remover" : "Adicionar"} ${character.name} ${character.favorite ? "dos" : "aos"} favoritos`}
              aria-pressed={character.favorite}
            >
              <Bookmark
                size={15}
                fill={character.favorite ? "currentColor" : "none"}
              />
            </button>
          </article>
        ))}
      </div>
      {!visible.length && (
        <div className="empty-state">
          <Search size={27} />
          <h3>Nenhuma história por aqui.</h3>
          <p>Tente outro nome ou ajuste seus filtros.</p>
          <button
            className="secondary-button"
            onClick={() => {
              setQuery("");
              setFamilyOnly(false);
              setTab("Todos os personagens");
            }}
          >
            Limpar filtros
          </button>
        </div>
      )}
      <div className="archive-note">
        <Sparkles size={18} strokeWidth={1} aria-hidden="true" />
        <p>
          Grandes universos são feitos de pequenos detalhes.
          <br />
          <em>Continue dando vida à sua história.</em>
        </p>
        <Sparkles size={18} strokeWidth={1} aria-hidden="true" />
      </div>
    </section>
  );
}
