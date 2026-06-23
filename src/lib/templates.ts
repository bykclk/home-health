/**
 * Quick-start templates: common rooms with typical cleaning tasks. Labels are
 * i18n keys resolved to the active language at insertion time (room/task names
 * are stored as plain data, not keys).
 */
export interface TemplateTask {
  titleKey: string;
  intervalDays: number;
  emoji: string;
}

export interface TemplateRoom {
  id: string;
  labelKey: string;
  emoji: string;
  tasks: TemplateTask[];
}

export const TEMPLATES: TemplateRoom[] = [
  {
    id: 'kitchen',
    labelKey: 'tpl.kitchen',
    emoji: '🍳',
    tasks: [
      { titleKey: 'tpl.dishes', intervalDays: 1, emoji: '🍽️' },
      { titleKey: 'tpl.wipeCounters', intervalDays: 2, emoji: '🧽' },
      { titleKey: 'tpl.trash', intervalDays: 3, emoji: '🗑️' },
      { titleKey: 'tpl.mopFloor', intervalDays: 7, emoji: '🧹' },
    ],
  },
  {
    id: 'bathroom',
    labelKey: 'tpl.bathroom',
    emoji: '🛁',
    tasks: [
      { titleKey: 'tpl.cleanSink', intervalDays: 3, emoji: '🚿' },
      { titleKey: 'tpl.toilet', intervalDays: 3, emoji: '🚽' },
      { titleKey: 'tpl.scrubShower', intervalDays: 7, emoji: '🚿' },
    ],
  },
  {
    id: 'livingRoom',
    labelKey: 'tpl.livingRoom',
    emoji: '🛋️',
    tasks: [
      { titleKey: 'tpl.vacuum', intervalDays: 5, emoji: '🧹' },
      { titleKey: 'tpl.dust', intervalDays: 14, emoji: '✨' },
    ],
  },
  {
    id: 'bedroom',
    labelKey: 'tpl.bedroom',
    emoji: '🛏️',
    tasks: [
      { titleKey: 'tpl.tidy', intervalDays: 2, emoji: '🧺' },
      { titleKey: 'tpl.changeSheets', intervalDays: 7, emoji: '🛏️' },
    ],
  },
];

/** A language-resolved pack ready to insert. */
export interface TemplatePack {
  roomLabel: string;
  roomEmoji?: string;
  tasks: { title: string; intervalDays: number; emoji?: string }[];
}
