import { Rule } from './Rule';
import { Sheet } from './Sheet';
import {
  keyframesInput,
  KeyframesOutput,
  KeyframeStages,
  StyleObject,
} from './types';
import { forIn } from './utils/forIn';
import { isValidProperty } from './utils/is';

export function addKeyframes<KF extends string>(
  sheet: Sheet,
  input: keyframesInput<KF>,
): KeyframesOutput<KF> {
  const keyframes: Record<KF, string> = {} as KeyframesOutput<KF>;

  forIn(input, (name: string, stages: KeyframeStages) => {
    const hashed = [sheet.name, sheet.seq(), name].join('_');
    keyframes[name as KF] = hashed;
    sheet.append(`@keyframes ${hashed} {`);

    forIn(stages, (stage: string, stylesObject: StyleObject) => {
      sheet.append(`${stage} {`);
      forIn(stylesObject, (key: string, value) => {
        if (isValidProperty(key, value)) {
          sheet.appendInline(Rule.genRule(key, value));
        }
      });
      sheet.appendInline('}');
    });
    sheet.append('}');
  });

  return keyframes;
}
