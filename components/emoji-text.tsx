import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface EmojiTextProps {
  children: string;
  style?: any;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

/**
 * EmojiText component that properly sizes emoji inline with text
 * Emoji are rendered at the same size as the surrounding text
 */
export function EmojiText({ children, style, type = 'default' }: EmojiTextProps) {
  const textColor = useThemeColor({}, 'text');

  // Split text into parts: emoji and non-emoji
  const parts = children.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]|[^\p{Emoji_Presentation}\p{Extended_Pictographic}]+/gu) || [];

  // Determine font size based on type
  let fontSize = 14;
  let lineHeight = 21;
  let fontWeight: any = 'normal';

  switch (type) {
    case 'title':
      fontSize = 32;
      lineHeight = 40;
      fontWeight = 'bold';
      break;
    case 'subtitle':
      fontSize = 20;
      fontWeight = 'bold';
      break;
    case 'defaultSemiBold':
      fontSize = 16;
      lineHeight = 24;
      fontWeight = '600';
      break;
    case 'link':
      fontSize = 16;
      lineHeight = 30;
      break;
    default:
      fontSize = 14;
      lineHeight = 21;
  }

  // Check if a string is emoji
  const isEmoji = (str: string): boolean => {
    return /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu.test(str);
  };

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize,
          lineHeight,
          fontWeight,
        },
        style,
      ]}
    >
      {parts.map((part, index) => {
        if (isEmoji(part)) {
          // Render emoji at 85% of text size to keep it inline
          return (
            <Text key={index} style={{ fontSize: fontSize * 0.85 }}>
              {part}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
