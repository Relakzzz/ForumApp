import { StyleSheet, View, Pressable, Image, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseImagesFromHtml } from '@/lib/image-parser';

interface QuotedPostProps {
  username: string;
  content: string;
  rawHtml?: string;
  nestLevel?: number;
  onPress?: () => void;
}

const MAX_NEST_LEVEL = 3; // Prevent infinite nesting display

export function QuotedPost({ 
  username, 
  content, 
  rawHtml,
  nestLevel = 0,
  onPress 
}: QuotedPostProps) {
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  
  // Limit nesting depth for display
  const displayNestLevel = Math.min(nestLevel, MAX_NEST_LEVEL);
  
  // Calculate left padding based on nesting level
  const leftPadding = displayNestLevel * 12;
  
  // Extract images if rawHtml is provided
  const images = rawHtml ? parseImagesFromHtml(rawHtml) : [];
  
  // Truncate content if too long
  const displayContent = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;
  
  // Determine background color based on nesting level and theme
  const bgColor = colorScheme === 'dark'
    ? `rgba(255, 255, 255, ${0.03 + displayNestLevel * 0.02})`
    : `rgba(0, 0, 0, ${0.04 + displayNestLevel * 0.02})`;

  return (
    <Pressable 
      onPress={onPress}
      style={[
        styles.container,
        {
          marginLeft: leftPadding,
          borderLeftColor: tintColor,
          backgroundColor: bgColor,
        }
      ]}
    >
      <View style={styles.header}>
        <ThemedText 
          type="defaultSemiBold" 
          style={styles.username}
          numberOfLines={1}
        >
          {username}:
        </ThemedText>
        {displayNestLevel > 0 && (
          <ThemedText 
            style={[styles.nestIndicator, { color: borderColor }]}
          >
            (reply)
          </ThemedText>
        )}
      </View>
      
      <ThemedText 
        style={[styles.content, { color: textColor }]}
        numberOfLines={3}
      >
        {displayContent}
      </ThemedText>

      {images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.imageContainer}
        >
          {images.map((img, index) => (
            <Image 
              key={index}
              source={{ uri: img.url }}
              style={styles.quotedImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  username: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  nestIndicator: {
    fontSize: 10,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  content: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.85,
  },
  imageContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  quotedImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
