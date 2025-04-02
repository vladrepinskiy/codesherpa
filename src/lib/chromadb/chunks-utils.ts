export function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  // Try to split on double newlines to preserve paragraph structure
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= chunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      if (paragraph.length <= chunkSize) {
        currentChunk = paragraph;
      } else {
        let remainingText = paragraph;
        while (remainingText) {
          const sentenceMatch = remainingText.match(
            /^([\s\S]{1,}?[.!?])\s+([\s\S]*)$/
          );

          if (sentenceMatch && sentenceMatch[1].length <= chunkSize) {
            chunks.push(sentenceMatch[1]);
            remainingText = sentenceMatch[2];
          } else {
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
