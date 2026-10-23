export interface Character {
  id: string;
  name: string;
  portrait: number;
  biography: string;
  appearance: string;
  origin: string;
  species: string;
  favorite: boolean;
}
export const initialCharacters: Character[] = [
  "Raffaell Tyrrell",
  "Natasha Tyrrell",
  "Emilly",
  "Lilith",
  "Angelo",
  "Lizzie",
].map((name, portrait) => ({
  id: name.toLowerCase().split(" ")[0],
  name,
  portrait,
  biography: "",
  appearance: "",
  origin: "",
  species: "",
  favorite: false,
}));
export const family = [
  { id: "emilly", label: "Filha · vínculo biológico", kind: "biological" },
  { id: "lilith", label: "Filha · vínculo biológico", kind: "biological" },
  { id: "angelo", label: "Filho · vínculo biológico", kind: "biological" },
  {
    id: "lizzie",
    label: "Filha reconhecida · vínculo afetivo",
    kind: "recognized",
  },
];
export const sections = [
  "Biblioteca",
  "Personagens",
  "História",
  "Locais",
  "Cronologia",
  "Relações",
  "Regras do Universo",
] as const;
export type Section = (typeof sections)[number] | "Portal";
