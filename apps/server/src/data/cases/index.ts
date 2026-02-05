import { CaseDefinition } from '@shadows/shared';
import { missingHeiress } from './missing-heiress';
import { siliconGhost } from './silicon-ghost';
import { ginJointBlues } from './gin-joint-blues';
import { lanternFestival } from './lantern-festival';

export const cases: Record<string, CaseDefinition> = {
  'missing-heiress': missingHeiress,
  'silicon-ghost': siliconGhost,
  'gin-joint-blues': ginJointBlues,
  'lantern-festival': lanternFestival,
};

export const caseList = Object.values(cases).map((c) => ({
  id: c.id,
  title: c.title,
  setting: c.setting,
  synopsis: c.synopsis,
}));
