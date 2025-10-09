import type { ParsedLesson, LessonCell, TextCell } from '../types';

// Naive YAML parser for simple key: value pairs, including multiline values indicated by `|`.
const parseSimpleYaml = (yamlString: string): Record<string, any> => {
  const metadata: Record<string, any> = {};
  const lines = yamlString.split('\n');
  let currentKey = '';
  let isMultiline = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isMultiline) {
      if (line.startsWith('  ') || line.trim() === '') {
        metadata[currentKey] += '\n' + line.substring(2);
      } else {
        isMultiline = false;
        // This line is not part of the multiline value, so re-process it.
        i--; 
      }
      continue;
    }

    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      if (value.endsWith('|')) {
        isMultiline = true;
        currentKey = key;
        metadata[currentKey] = '';
      } else {
        // Handle JSON-like arrays for quiz options
        if (value.startsWith('[') && value.endsWith(']')) {
            try {
                metadata[key] = JSON.parse(value.replace(/'/g, '"'));
            } catch {
                metadata[key] = value;
            }
        } else {
            metadata[key] = value;
        }
      }
    }
  }

  // Trim the multiline values
  for (const key in metadata) {
      if (typeof metadata[key] === 'string') {
          metadata[key] = metadata[key].trim();
      }
  }

  return metadata;
};


export const parseLesson = (rawContent: string): ParsedLesson => {
  const frontMatterMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  let metadata = {};
  let content = rawContent;

  if (frontMatterMatch) {
    metadata = parseSimpleYaml(frontMatterMatch[1]);
    content = rawContent.slice(frontMatterMatch[0].length);
  }

  const cellStrings = content.split(/^\s*---\s*$/m);

  const cells: LessonCell[] = cellStrings
    .map(cellString => cellString.trim())
    .filter(Boolean)
    .map(trimmedCell => {
      if (trimmedCell.startsWith('type:')) {
        const cellData = parseSimpleYaml(trimmedCell);
        if (cellData.type && ['code', 'quiz'].includes(cellData.type as string)) {
          return cellData as LessonCell;
        }
        return { type: 'unknown', data: cellData, rawContent: trimmedCell } as LessonCell;
      } else {
        return { type: 'text', content: trimmedCell } as TextCell;
      }
    });

  return { metadata, cells };
};
