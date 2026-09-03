import { Rule, toCssIdent } from './Rule';
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
    keyframes[name as KF] = claimKeyframeName(sheet, name, stages);
  });

  return keyframes;
}

function claimKeyframeName(
  sheet: Sheet,
  name: string,
  stages: KeyframeStages,
): string {
  const seq = sheet.keyframeSeq();
  const hashed = formatKeyframeName(sheet.name, seq, name);
  const block = buildKeyframeBlock(hashed, stages);
  if (sheet.adoptedKeyframeBody(hashed) === stripWhitespace(block)) {
    return hashed;
  }
  return takeFreeKeyframeName(sheet, name, stages, seq);
}

function takeFreeKeyframeName(
  sheet: Sheet,
  name: string,
  stages: KeyframeStages,
  start: number,
): string {
  let counter = start;
  let hashed = formatKeyframeName(sheet.name, counter, name);
  while (sheet.isKeyframeNameTaken(hashed)) {
    counter += 1;
    hashed = formatKeyframeName(sheet.name, counter, name);
  }
  sheet.append(buildKeyframeBlock(hashed, stages));
  sheet.markKeyframeNameUsed(hashed);
  return hashed;
}

function formatKeyframeName(
  sheetName: string,
  counter: number,
  name: string,
): string {
  return `${toCssIdent(sheetName)}_${counter}_${toCssIdent(name)}`;
}

function buildKeyframeBlock(hashed: string, stages: KeyframeStages): string {
  let block = `@keyframes ${hashed} {`;
  forIn(stages, (stage: string, stylesObject: StyleObject) => {
    block = appendKeyframeStage(block, stage, stylesObject);
  });
  return `${block}\n}`;
}

function appendKeyframeStage(
  block: string,
  stage: string,
  stylesObject: StyleObject,
): string {
  let output = `${block}\n${stage} {`;
  forIn(stylesObject, (key: string, value) => {
    if (isValidProperty(key, value)) {
      output = `${output} ${Rule.genRule(key, value)}`;
    }
  });
  return `${output} }`;
}

function stripWhitespace(value: string): string {
  return value.replace(/\s+/g, '');
}
