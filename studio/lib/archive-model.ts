export const canonStates = ['Confirmada', 'Registrada no manuscrito', 'Em desenvolvimento', 'Hipótese', 'Contraditória', 'Descartada'] as const;
export type CanonState = typeof canonStates[number];
export type Kind = 'Personagens' | 'Espécies e culturas' | 'Atlas' | 'Instituições' | 'Cronologia' | 'Histórias' | 'Graphic novel' | 'Segredos' | 'Cânone';
export type Field = { id: string; label: string; value: string; status: CanonState };
export type Entry = { id: string; kind: Kind; name: string; status: CanonState; fields: Field[]; links: string[]; secret: boolean; meta: Record<string,string>; image?: string; favorite?: boolean };
export type Revision = { id: string; entryId: string; at: string; snapshot: Entry };
export type Archive = { schemaVersion: 1; entries: Entry[]; revisions: Revision[] };
export const kinds: Kind[] = ['Personagens','Espécies e culturas','Atlas','Instituições','Cronologia','Histórias','Graphic novel','Segredos','Cânone'];
export const emptyField = (label: string): Field => ({id:label, label,value:'Não definido',status:'Em desenvolvimento'});
export function createEntry(kind: Kind): Entry {
 const meta:Record<string,string> = kind==='Personagens'?Object.fromEntries(['Espécie','Família','Domínio','Idade aparente','Idade cronológica','Origem','Local','Período','Participação'].map(k=>[k,'Não definido'])):kind==='Graphic novel'?{Ordem:'1',Produção:'Planejada',Projeto:'Não definido'}:kind==='Histórias'?{Tipo:'Rascunho'}:kind==='Cronologia'?{Período:'Não definido',Ordem:'0'}:{};
 const labels=kind==='Personagens'?['Identidade','Aparência','Psicologia','Domínio','Manifestações','Habilidades confirmadas','Habilidades hipotéticas','Limitações','Consequências','História','Relações','Design']:kind==='Cronologia'?['Acontecimento','Consequências']:kind==='Graphic novel'?['Descrição visual','Número de quadros','Versão','Motivo da revisão']:kind==='Segredos'?['Conteúdo','Quem conhece','Momento da revelação','Capítulos autorizados']:kind==='Atlas'?['Descrição','História','Geografia','População','Espécies','Relações políticas']:kind==='Histórias'?['Texto literário','Anotações de revisão']:['Descrição'];
 return {id:crypto.randomUUID(),kind,name:'Novo registro',status:'Em desenvolvimento',secret:kind==='Segredos',meta,links:[],fields:labels.map(emptyField)};
}
