import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../src/constants/placements.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { PLACEMENTS, POSITIONS, LAZADA_POSITIONS, BIYAN_SECURITY_POSITIONS, KALIMANTAN_CARGO_POSITIONS, getPositionsForPlacement } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('BLITZ has only SPRINTER and all existing placements retain their options', () => {
  assert.ok(PLACEMENTS.includes('PT.BLITZ ELECTRIC'));
  assert.deepEqual(getPositionsForPlacement('PT.BLITZ ELECTRIC'), ['SPRINTER']);
  const kalimantanCargo = ['CARGO BANJARMASIN', 'CARGO SAMARINDA', 'CARGO BALIKPAPAN'];
  for (const placement of kalimantanCargo) {
    assert.ok(PLACEMENTS.includes(placement));
    assert.deepEqual(getPositionsForPlacement(placement), KALIMANTAN_CARGO_POSITIONS);
  }
  for (const placement of PLACEMENTS.filter(value => value !== 'PT.BLITZ ELECTRIC' && value !== 'J&T CARGO Pontianak 99A' && !kalimantanCargo.includes(value))) {
    const expected = placement === 'LAZADA' ? LAZADA_POSITIONS : placement === 'BIYAN SECURITY' ? BIYAN_SECURITY_POSITIONS : POSITIONS;
    assert.deepEqual(getPositionsForPlacement(placement), expected);
    assert.ok(!getPositionsForPlacement(placement).includes('SPRINTER'));
  }
});

test('Pontianak offers exactly the five requested positions', () => {
  assert.ok(PLACEMENTS.includes('J&T CARGO Pontianak 99A'));
  assert.deepEqual(getPositionsForPlacement('J&T CARGO Pontianak 99A'), ['SORTER', 'BONGKAR MUAT', 'CLEANING SERVICE', 'SECURITY', 'KORDINATOR']);
  for (const placement of PLACEMENTS.filter(value => value !== 'J&T CARGO Pontianak 99A')) {
    for (const position of ['SORTER', 'BONGKAR MUAT', 'CLEANING SERVICE', 'KORDINATOR']) assert.ok(!getPositionsForPlacement(placement).includes(position));
  }
});
