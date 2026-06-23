/**
 * Quick-start templates: common rooms with typical cleaning tasks. Labels are
 * i18n keys resolved to the active language at insertion time (room/task names
 * are stored as plain data, not keys).
 */
export interface TemplateTask {
  titleKey: string;
  intervalDays: number;
}

export interface TemplateRoom {
  id: string;
  labelKey: string;
  tasks: TemplateTask[];
}

export const TEMPLATES: TemplateRoom[] = [
  {
    id: 'kitchen',
    labelKey: 'tpl.kitchen',
    tasks: [
      { titleKey: 'tpl.dishes', intervalDays: 1 },
      { titleKey: 'tpl.wipeCounters', intervalDays: 2 },
      { titleKey: 'tpl.trash', intervalDays: 3 },
      { titleKey: 'tpl.mopFloor', intervalDays: 7 },
    ],
  },
  {
    id: 'bathroom',
    labelKey: 'tpl.bathroom',
    tasks: [
      { titleKey: 'tpl.cleanSink', intervalDays: 3 },
      { titleKey: 'tpl.toilet', intervalDays: 3 },
      { titleKey: 'tpl.scrubShower', intervalDays: 7 },
    ],
  },
  {
    id: 'livingRoom',
    labelKey: 'tpl.livingRoom',
    tasks: [
      { titleKey: 'tpl.vacuum', intervalDays: 5 },
      { titleKey: 'tpl.dust', intervalDays: 14 },
    ],
  },
  {
    id: 'bedroom',
    labelKey: 'tpl.bedroom',
    tasks: [
      { titleKey: 'tpl.tidy', intervalDays: 2 },
      { titleKey: 'tpl.changeSheets', intervalDays: 7 },
    ],
  },
];

/** A language-resolved pack ready to insert. */
export interface TemplatePack {
  roomLabel: string;
  tasks: { title: string; intervalDays: number }[];
}
