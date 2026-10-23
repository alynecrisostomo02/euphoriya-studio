"use client";
import { useState } from "react";
import { Network } from "lucide-react";
import { type Character, family } from "../lib/characters";
import { Portrait } from "./character-gallery";
export function Relationships({
  characters,
  onOpen,
}: {
  characters: Character[];
  onOpen: (c: Character) => void;
}) {
  const [filter, setFilter] = useState("all");
  const father = characters.find((c) => c.id === "raffaell")!;
  return (
    <section>
      <div className="section-heading">
        <div>
          <div className="eyebrow">FIOS QUE NOS CONECTAM</div>
          <h2>Laços de família</h2>
          <p>Diferentes origens. O mesmo pertencimento.</p>
        </div>
        <Network size={34} strokeWidth={1} />
      </div>
      <div className="tabs">
        {[
          ["all", "Todos os laços"],
          ["biological", "Biológicos"],
          ["recognized", "Reconhecimento afetivo"],
        ].map(([id, name]) => (
          <button
            key={id}
            className={filter === id ? "selected" : ""}
            onClick={() => setFilter(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="family-canvas">
        <button
          className="family-node parent-node"
          onClick={() => onOpen(father)}
        >
          <Portrait character={father} />
          <h3>{father.name}</h3>
          <small>PAI</small>
        </button>
        <div className="family-stem" />
        <div className="family-children">
          {family
            .filter((f) => filter === "all" || filter === f.kind)
            .map((f) => {
              const child = characters.find((c) => c.id === f.id)!;
              return (
                <div className={`family-branch ${f.kind}`} key={f.id}>
                  <button className="family-node" onClick={() => onOpen(child)}>
                    <Portrait character={child} />
                    <h3>{child.name}</h3>
                    <small>{f.label}</small>
                  </button>
                </div>
              );
            })}
        </div>
      </div>
      <div className="relationship-legend">
        <span>
          <i /> Vínculo biológico
        </span>
        <span>
          <i className="dashed" /> Reconhecimento afetivo
        </span>
      </div>
      <p className="relationship-note">
        Lizzie é reconhecida por Raffaell como sua filha. O traço distingue a
        origem do vínculo, nunca sua legitimidade. Adoção formal não
        especificada. Nenhuma relação de Natasha foi presumida.
      </p>
    </section>
  );
}
