export function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  // Try to split on double newlines to preserve paragraph structure
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      // If paragraph is too big for a single chunk, split it further
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      if (paragraph.length <= chunkSize) {
        currentChunk = paragraph;
      } else {
        // Split long paragraph into smaller chunks
        let remainingText = paragraph;
        while (remainingText) {
          // Try to split on sentence boundaries when possible
          const sentenceMatch = remainingText.match(
            /^([\s\S]{1,}?[.!?])\s+([\s\S]*)$/
          );

          if (sentenceMatch && sentenceMatch[1].length <= chunkSize) {
            chunks.push(sentenceMatch[1]);
            remainingText = sentenceMatch[2];
          } else {
            // Otherwise just take a chunk of the maximum size
            chunks.push(remainingText.slice(0, chunkSize));
            remainingText = remainingText.slice(chunkSize);
          }
        }
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
