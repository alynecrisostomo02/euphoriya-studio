"use client";
import { useEffect, useRef, useState } from "react";
import { X, Feather, Check, Network } from "lucide-react";
import { type Character, family } from "../lib/characters";
import { Portrait } from "./character-gallery";
export function CharacterDialog({
  character,
  characters,
  onClose,
  onSave,
}: {
  character: Character;
  characters: Character[];
  onClose: () => void;
  onSave: (character: Character) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(character);
  const [editing, setEditing] = useState(!character.name);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const fields = [
    ["biography", "Biografia"],
    ["appearance", "Aparência"],
    ["origin", "Origem"],
    ["species", "Espécie"],
  ] as const;
  const links =
    character.id === "raffaell"
      ? family.map(
          (f) =>
            `${characters.find((c) => c.id === f.id)?.name ?? f.id} — ${f.label.toLowerCase()}`,
        )
      : family.some((f) => f.id === character.id)
        ? [
            `Raffaell Tyrrell — pai${character.id === "lizzie" ? " por reconhecimento afetivo" : " biológico"}`,
          ]
        : [];
  return (
    <dialog
      ref={dialog}
      aria-label={`Perfil de ${draft.name || "novo personagem"}`}
      className="profile-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="dialog-close icon-button"
        aria-label="Fechar perfil"
        onClick={onClose}
      >
        <X size={21} />
      </button>
      <div className="profile-layout">
        <div className="profile-art">
          <Portrait character={draft} />
          <span>INTERPRETAÇÃO VISUAL · NÃO CANÔNICA</span>
        </div>
        <form
          className="profile-content"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.name.trim())
              onSave({ ...draft, name: draft.name.trim() });
          }}
        >
          <div className="eyebrow">ARQUIVO DE PERSONAGEM</div>
          {editing ? (
            <label className="field-label">
              Nome
              <input
                required
                maxLength={100}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
          ) : (
            <h2>{draft.name}</h2>
          )}
          <p className="profile-notice">
            Um retrato em construção. Campos não preenchidos não representam
            fatos canônicos.
          </p>
          <div className="profile-fields">
            {fields.map(([key, title]) => (
              <div key={key}>
                <label className="field-label" htmlFor={key}>
                  {title}
                </label>
                {editing ? (
                  key === "biography" || key === "appearance" ? (
                    <textarea
                      id={key}
                      value={draft[key]}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                      placeholder="Escreva suas notas de teste..."
                    />
                  ) : (
                    <input
                      id={key}
                      value={draft[key]}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.value })
                      }
                      placeholder="Ainda não definido"
                    />
                  )
                ) : (
                  <p className={!draft[key] ? "undefined-field" : ""}>
                    {draft[key] || "Ainda não definido"}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="profile-relations">
            <h3>
              <Network size={16} /> Laços familiares
            </h3>
            {links.length ? (
              links.map((link) => <p key={link}>{link}</p>)
            ) : (
              <p className="undefined-field">Nenhuma relação informada.</p>
            )}
            {character.id === "lizzie" && (
              <small>
                Filiação reconhecida. Adoção formal não especificada.
              </small>
            )}
          </div>
          <div className="profile-actions">
            {editing ? (
              <button className="primary-button" type="submit">
                <Check size={16} /> Salvar alterações
              </button>
            ) : (
              <button
                className="primary-button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setEditing(true);
                }}
              >
                <Feather size={16} /> Editar personagem
              </button>
            )}
            <span>Alterações apenas nesta sessão.</span>
          </div>
        </form>
      </div>
    </dialog>
  );
}
