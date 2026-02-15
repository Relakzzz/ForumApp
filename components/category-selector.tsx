import React, { useState } from "react";
import { StyleSheet, Pressable, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "./ui/icon-symbol";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategorySelector({ categories, selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "icon");
  const backgroundColor = useThemeColor({}, "background");

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (slug: string | null) => {
    onSelectCategory(slug);
    toggleExpand();
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name || "Category"
    : "All Categories";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Pressable 
        onPress={toggleExpand} 
        style={[styles.header, { borderColor: borderColor + "40" }]}
      >
        <View style={styles.headerLeft}>
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={tintColor} />
          <ThemedText style={styles.headerText}>
            {selectedCategoryName}
          </ThemedText>
        </View>
        <IconSymbol 
          name={isExpanded ? "chevron.up" : "chevron.down"} 
          size={16} 
          color={textColor + "60"} 
        />
      </Pressable>

      {isExpanded && (
        <View style={styles.menu}>
          <Pressable
            onPress={() => handleSelect(null)}
            style={[
              styles.menuItem,
              selectedCategory === null && { backgroundColor: tintColor + "15" }
            ]}
          >
            <ThemedText style={[
              styles.menuItemText,
              selectedCategory === null && { color: tintColor, fontWeight: "600" }
            ]}>
              All Categories
            </ThemedText>
          </Pressable>

          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => handleSelect(category.slug)}
              style={[
                styles.menuItem,
                selectedCategory === category.slug && { backgroundColor: tintColor + "15" }
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.colorDot, { backgroundColor: `#${category.color}` }]} />
                <ThemedText style={[
                  styles.menuItemText,
                  selectedCategory === category.slug && { color: tintColor, fontWeight: "600" }
                ]}>
                  {category.name}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  menu: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
