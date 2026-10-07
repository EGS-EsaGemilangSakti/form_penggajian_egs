import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/constants/placements.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { PLACEMENTS, POSITIONS, LAZADA_POSITIONS, BIYAN_SECURITY_POSITIONS, getPositionsForPlacement } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('BLITZ has only SPRINTER and all existing placements retain their options', () => {
  assert.ok(PLACEMENTS.includes('PT.BLITZ ELECTRIC'));
  assert.deepEqual(getPositionsForPlacement('PT.BLITZ ELECTRIC'), ['SPRINTER']);
  for (const placement of PLACEMENTS.filter(value => value !== 'PT.BLITZ ELECTRIC')) {
    const expected = placement === 'LAZADA' ? LAZADA_POSITIONS : placement === 'BIYAN SECURITY' ? BIYAN_SECURITY_POSITIONS : POSITIONS;
    assert.deepEqual(getPositionsForPlacement(placement), expected);
    assert.ok(!getPositionsForPlacement(placement).includes('SPRINTER'));
  }
});
