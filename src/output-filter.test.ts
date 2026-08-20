import { describe, expect, it } from 'vitest';

import { StreamingOutputFilter, stripInternalOutput } from './output-filter.js';

describe('StreamingOutputFilter', () => {
  it('does not expose an internal block split across chunks', () => {
    const filter = new StreamingOutputFilter();
    const output = [
      filter.push('Visible<inte'),
      filter.push('rnal>secret'),
      filter.push('</inter'),
      filter.push('nal> answer'),
      filter.finish(),
    ].join('');

    expect(output).toBe('Visible answer');
  });

  it('preserves tag-like ordinary text that is not an internal tag', () => {
    const filter = new StreamingOutputFilter();
    const output = filter.push('Use <interface> safely') + filter.finish();

    expect(output).toBe('Use <interface> safely');
  });

  it('drops an unterminated internal region from a settled answer', () => {
    expect(stripInternalOutput('Answer<internal>private')).toBe('Answer');
  });

  it('removes multiple internal regions', () => {
    expect(
      stripInternalOutput(
        'A<internal>one</internal>B<internal>two</internal>C',
      ),
    ).toBe('ABC');
  });
});
