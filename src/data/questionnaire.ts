// Ported verbatim from questionnaire-data.json — the approved, clinically reviewed
// question/chapter/character/guide content. Do not edit question text, option text,
// order, point values, or branching rules here.

import raw from './questionnaire-data.json';

export interface CharDef {
  name: string;
  trait: string;
}

export interface GuideDef {
  name: string;
  trait: string;
  greet: string;
}

export interface ChapterDef {
  key: string;
  title: string;
  stop: string;
  intro: string;
  outro: string | null;
  qids: string[];
}

export interface OptionDef {
  t: string;
  p: number | null;
  all?: boolean;
}

export type WhenRule =
  | { k: 'always' }
  | { k: 'gte'; dep: string; n: number }
  | { k: 'eq'; dep: string; n: number }
  | { k: 'any'; deps: string[] };

export interface QuestionDef {
  id: string;
  dom: string;
  type: 'score' | 'plan' | 'flag';
  text: string;
  opts: OptionDef[];
  when: WhenRule;
  note: string | null;
  multi: boolean;
  exclusive: number[];
  allOf: number[];
}

export interface QuestionnaireData {
  chars: CharDef[];
  guides: GuideDef[];
  chapters: ChapterDef[];
  qs: QuestionDef[];
  dom: Record<string, string>;
}

export const D: QuestionnaireData = raw as unknown as QuestionnaireData;

export const byId: Record<string, QuestionDef> = {};
D.qs.forEach((q) => {
  byId[q.id] = q;
});

export const chapterOf: Record<string, number> = {};
D.chapters.forEach((c, ci) => {
  c.qids.forEach((id) => {
    chapterOf[id] = ci;
  });
});
