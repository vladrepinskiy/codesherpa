import { FileContent } from "@/types/repository";
import { glob } from "glob";
import path from "path";
import fs from "fs/promises";

// Define regexes to ignore in this array
const ignoreList = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/package-lock.json",
  "**/pnpm-lock.yaml",
  "**/yarn.lock",
  "**/npm-shrinkwrap.json",
  "**/coverage/**",
  "**/generated/**",
  "**/out/**",
];

// Lower threshold for specific file types that are typically large
const reducedSizeThreshold = 100 * 1024; // 100KB
const defaultThreshold = 512 * 1024; // 0,5MB
const reducedSizeFilePatterns = [
  /\.(json|yaml|yml|xml|csv|tsv|log|svg)$/i, // Data files
];

function isBinaryPath(filePath: string): boolean {
  const binaryExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".ico",
    ".svg",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".ttf",
    ".otf",
    ".woff",
    ".woff2",
    ".mp3",
    ".mp4",
    ".wav",
    ".avi",
    ".mov",
    ".sqlite",
    ".db",
  ];

  const extension = path.extname(filePath).toLowerCase();
  return binaryExtensions.includes(extension);
}

/**
 * Determines the appropriate size threshold for a file
 */
function getSizeThreshold(filePath: string): number {
  const basename = path.basename(filePath);
  for (const pattern of reducedSizeFilePatterns) {
    if (pattern.test(basename) || pattern.test(filePath)) {
      return reducedSizeThreshold;
    }
  }
  return defaultThreshold;
}

/**
 * Maps popular programming languages file extensions to their human-readable names.
 */
function getLanguageFromPath(filePath: string): string | null {
  const extension = path.extname(filePath).toLowerCase();
  const extensionMap: Record<string, string> = {
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".py": "Python",
    ".rb": "Ruby",
    ".java": "Java",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".md": "Markdown",
    ".json": "JSON",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    // TODO: add more, or expose to users to modify!
  };

  return extensionMap[extension] || null;
}

/**
 * Process and list all relevant files in the repository
 */
export async function processRepositoryFiles(
  repoDir: string
): Promise<FileContent[]> {
  console.log(`Starting repository file processing at ${repoDir}`);
  const files = await glob("**/*", {
    cwd: repoDir,
    ignore: ignoreList,
    nodir: true,
  });

  console.log(`Found ${files.length} files after glob filtering`);
  const fileContents: FileContent[] = [];
  let skippedCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(repoDir, file);
      const stats = await fs.stat(filePath);
      const sizeThreshold = getSizeThreshold(file);
      if (stats.size > sizeThreshold) {
        console.log(
          `Skipping large file (${(stats.size / 1024).toFixed(2)}KB > ${(
            sizeThreshold / 1024
          ).toFixed(2)}KB threshold): ${file}`
        );
        skippedCount++;
        continue;
      }
      if (isBinaryPath(file)) {
        console.log(`Skipping binary file: ${file}`);
        skippedCount++;
        continue;
      }
      const content = await fs.readFile(filePath, "utf-8");
      // Additional content-based filtering
      // Skip files with too many lines
      const lineCount = content.split("\n").length;
      if (lineCount > 5000) {
        console.log(
          `Skipping file with too many lines (${lineCount}): ${file}`
        );
        skippedCount++;
        continue;
      }
      fileContents.push({
        path: file,
        content,
        language: getLanguageFromPath(file),
        size_bytes: stats.size,
        last_modified: stats.mtime.toISOString(),
      });
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      skippedCount++;
    }
  }

  console.log(
    `Repository processing complete. Included ${fileContents.length} files, skipped ${skippedCount} files.`
  );
  return fileContents;
}
