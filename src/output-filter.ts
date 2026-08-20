const INTERNAL_OPEN = '<internal>';
const INTERNAL_CLOSE = '</internal>';

function longestTagPrefixSuffix(value: string, tag: string): number {
  const max = Math.min(value.length, tag.length - 1);
  for (let length = max; length > 0; length--) {
    if (tag.startsWith(value.slice(-length))) return length;
  }
  return 0;
}

/**
 * Removes <internal>...</internal> regions without exposing tags or their
 * contents when either tag is split across model stream chunks.
 */
export class StreamingOutputFilter {
  private buffer = '';
  private insideInternal = false;

  push(chunk: string): string {
    this.buffer += chunk;
    let visible = '';

    while (this.buffer) {
      if (this.insideInternal) {
        const closeIndex = this.buffer.indexOf(INTERNAL_CLOSE);
        if (closeIndex >= 0) {
          this.buffer = this.buffer.slice(closeIndex + INTERNAL_CLOSE.length);
          this.insideInternal = false;
          continue;
        }

        const retained = longestTagPrefixSuffix(this.buffer, INTERNAL_CLOSE);
        this.buffer = retained ? this.buffer.slice(-retained) : '';
        break;
      }

      const openIndex = this.buffer.indexOf(INTERNAL_OPEN);
      if (openIndex >= 0) {
        visible += this.buffer.slice(0, openIndex);
        this.buffer = this.buffer.slice(openIndex + INTERNAL_OPEN.length);
        this.insideInternal = true;
        continue;
      }

      const retained = longestTagPrefixSuffix(this.buffer, INTERNAL_OPEN);
      const visibleEnd = this.buffer.length - retained;
      visible += this.buffer.slice(0, visibleEnd);
      this.buffer = this.buffer.slice(visibleEnd);
      break;
    }

    return visible;
  }

  finish(): string {
    const visible = this.insideInternal ? '' : this.buffer;
    this.buffer = '';
    this.insideInternal = false;
    return visible;
  }
}

/** Strip complete or unterminated internal regions from a settled answer. */
export function stripInternalOutput(value: string): string {
  const filter = new StreamingOutputFilter();
  return (filter.push(value) + filter.finish()).trim();
}
