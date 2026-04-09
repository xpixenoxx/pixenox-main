'use client';

import React, { CSSProperties } from 'react';
import type { ContentBlock } from '@/lib/types/database';

interface AnimatedTextProps {
  blocks: ContentBlock[];
  className?: string;
}

/**
 * Renders JSONB content blocks with per-block and per-word styling.
 * Each block is rendered as a <p> with block_* styles.
 * Words matching the words[] array get wrapped in styled <span>.
 */
export default function AnimatedText({ blocks, className = '' }: AnimatedTextProps) {
  if (!Array.isArray(blocks)) return null;

  return (
    <div className={`animated-text ${className}`}>
      {blocks.map((block, blockIdx) => {
        const blockStyle: CSSProperties = {
          fontFamily: block.block_font_family,
          fontSize: block.block_font_size,
          fontWeight: block.block_font_weight as CSSProperties['fontWeight'],
          lineHeight: block.block_line_height,
          color: block.block_color,
        };

        // Create word map for quick lookup
        const wordMap = new Map(
          (block.words || []).map((w) => [w.word.toLowerCase(), w])
        );

        // Split text by spaces while preserving spacing
        const words = block.text.split(/(\s+)/);

        return (
          <p key={blockIdx} style={blockStyle}>
            {words.map((word, wordIdx) => {
              const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '').toLowerCase();
              const wordStyle = wordMap.get(cleanWord);

              if (wordStyle) {
                const styledCss: CSSProperties = {
                  color: wordStyle.color,
                  fontFamily: wordStyle.font_family,
                  fontSize: wordStyle.font_size,
                  fontWeight: wordStyle.font_weight as CSSProperties['fontWeight'],
                };
                return (
                  <span key={wordIdx} style={styledCss}>
                    {word}
                  </span>
                );
              }

              return <React.Fragment key={wordIdx}>{word}</React.Fragment>;
            })}
          </p>
        );
      })}
    </div>
  );
}
