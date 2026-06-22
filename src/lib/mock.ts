import { avatarColors } from '@/theme';
import type { Household, Member, Room, Task } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.now();
const daysAgo = (n: number) => new Date(now - n * DAY_MS).toISOString();

export const MEMBER_COLORS = avatarColors;

export const household: Household = {
  id: 'hh_1',
  name: 'Maple Street',
  inviteCode: 'MAPLE-7Q2',
};

export const members: Member[] = [
  { id: 'm_1', name: 'Ayşe', initial: 'A', color: MEMBER_COLORS[0], roleKey: 'members.roleOwner' },
  { id: 'm_2', name: 'Mehmet', initial: 'M', color: MEMBER_COLORS[1], roleKey: 'members.roleMember' },
  { id: 'm_3', name: 'Zeynep', initial: 'Z', color: MEMBER_COLORS[2], roleKey: 'members.roleMember' },
];

export const rooms: Room[] = [
  { id: 'r_1', label: 'Kitchen', position: 0 },
  { id: 'r_2', label: 'Living Room', position: 1 },
  { id: 'r_3', label: 'Bathroom', position: 2 },
  { id: 'r_4', label: 'Bedroom', position: 3 },
];

const created = daysAgo(40);

export const tasks: Task[] = [
  // Kitchen — a clean one, a due-soon one, an overdue one.
  {
    id: 't_1', roomId: 'r_1', title: 'Wipe the counters', repeatMode: 'interval', intervalDays: 2,
    assigneeIds: ['m_1'], createdAt: created,
    completions: [daysAgo(0), daysAgo(2), daysAgo(4), daysAgo(6)],
  },
  {
    id: 't_2', roomId: 'r_1', title: 'Take out the trash', repeatMode: 'interval', intervalDays: 3,
    assigneeIds: ['m_2'], createdAt: created,
    completions: [daysAgo(2), daysAgo(5), daysAgo(8)],
  },
  {
    id: 't_3', roomId: 'r_1', title: 'Mop the floor', repeatMode: 'interval', intervalDays: 7,
    assigneeIds: ['m_1', 'm_3'], createdAt: created,
    completions: [daysAgo(9), daysAgo(18)],
  },
  // Living Room
  {
    id: 't_4', roomId: 'r_2', title: 'Vacuum the rug', repeatMode: 'interval', intervalDays: 5,
    assigneeIds: ['m_3'], createdAt: created,
    completions: [daysAgo(3), daysAgo(9)],
  },
  {
    id: 't_5', roomId: 'r_2', title: 'Dust the shelves', repeatMode: 'interval', intervalDays: 14,
    assigneeIds: ['m_2'], createdAt: created,
    completions: [daysAgo(11)],
  },
  // Bathroom
  {
    id: 't_6', roomId: 'r_3', title: 'Clean the sink', repeatMode: 'interval', intervalDays: 3,
    assigneeIds: ['m_1'], createdAt: created,
    completions: [daysAgo(1), daysAgo(4)],
  },
  {
    id: 't_7', roomId: 'r_3', title: 'Scrub the shower', repeatMode: 'fixed', fixedWeekday: 6,
    assigneeIds: ['m_3'], createdAt: created,
    completions: [daysAgo(8)],
  },
  // Bedroom
  {
    id: 't_8', roomId: 'r_4', title: 'Change the sheets', repeatMode: 'interval', intervalDays: 7,
    assigneeIds: ['m_2'], createdAt: created,
    completions: [daysAgo(6)],
  },
  {
    id: 't_9', roomId: 'r_4', title: 'Tidy up', repeatMode: 'interval', intervalDays: 2,
    assigneeIds: ['m_1'], createdAt: created,
    completions: [daysAgo(1), daysAgo(3)],
  },
];
