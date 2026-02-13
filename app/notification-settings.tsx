import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Pressable, View, Switch, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { preferences, loading, updatePreferences } = useNotifications();

  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "off">("immediate");
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [replyNotifications, setReplyNotifications] = useState(true);

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "icon");

  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.enabled);
      setFrequency(preferences.frequency);
      setMentionNotifications(preferences.mentionNotifications);
      setReplyNotifications(preferences.replyNotifications);
    }
  }, [preferences]);

  const handleEnabledChange = async (value: boolean) => {
    setEnabled(value);
    try {
      await updatePreferences({ enabled: value });
    } catch (error) {
      console.error("[NotificationSettings] Error updating enabled:", error);
      setEnabled(!value);
    }
  };

  const handleFrequencyChange = async (value: "immediate" | "daily" | "off") => {
    setFrequency(value);
    try {
      await updatePreferences({ frequency: value });
    } catch (error) {
      console.error("[NotificationSettings] Error updating frequency:", error);
      setFrequency(frequency);
    }
  };

  const handleMentionChange = async (value: boolean) => {
    setMentionNotifications(value);
    try {
      await updatePreferences({ mentionNotifications: value });
    } catch (error) {
      console.error("[NotificationSettings] Error updating mentions:", error);
      setMentionNotifications(!value);
    }
  };

  const handleReplyChange = async (value: boolean) => {
    setReplyNotifications(value);
    try {
      await updatePreferences({ replyNotifications: value });
    } catch (error) {
      console.error("[NotificationSettings] Error updating replies:", error);
      setReplyNotifications(!value);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backText}>← Back</ThemedText>
        </Pressable>
        <ThemedText type="title">Notification Settings</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Enable Notifications
        </ThemedText>
        <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
          <ThemedText type="default">Push Notifications</ThemedText>
          <Switch
            value={enabled}
            onValueChange={handleEnabledChange}
            trackColor={{ false: "#767577", true: tintColor + "80" }}
            thumbColor={enabled ? tintColor : "#f4f3f4"}
          />
        </View>
        <ThemedText type="default" style={styles.description}>
          Receive notifications for new replies and mentions in topics you follow.
        </ThemedText>
      </ThemedView>

      {enabled && (
        <>
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notification Frequency
            </ThemedText>
            <ThemedText type="default" style={styles.description}>
              How often would you like to receive notifications?
            </ThemedText>

            <FrequencyOption
              label="Immediate"
              description="Get notified as soon as there's a new reply"
              selected={frequency === "immediate"}
              onPress={() => handleFrequencyChange("immediate")}
              borderColor={borderColor}
              tintColor={tintColor}
            />

            <FrequencyOption
              label="Daily Digest"
              description="Get a summary of new replies once per day"
              selected={frequency === "daily"}
              onPress={() => handleFrequencyChange("daily")}
              borderColor={borderColor}
              tintColor={tintColor}
            />

            <FrequencyOption
              label="Off"
              description="Don't receive notifications"
              selected={frequency === "off"}
              onPress={() => handleFrequencyChange("off")}
              borderColor={borderColor}
              tintColor={tintColor}
              last
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notification Types
            </ThemedText>

            <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
              <View style={styles.settingLabel}>
                <ThemedText type="default">Replies to Followed Topics</ThemedText>
                <ThemedText type="default" style={styles.settingDescription}>
                  Topics you've explicitly followed
                </ThemedText>
              </View>
              <Switch
                value={replyNotifications}
                onValueChange={handleReplyChange}
                trackColor={{ false: "#767577", true: tintColor + "80" }}
                thumbColor={replyNotifications ? tintColor : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <ThemedText type="default">Direct Mentions</ThemedText>
                <ThemedText type="default" style={styles.settingDescription}>
                  When someone mentions you in a post
                </ThemedText>
              </View>
              <Switch
                value={mentionNotifications}
                onValueChange={handleMentionChange}
                trackColor={{ false: "#767577", true: tintColor + "80" }}
                thumbColor={mentionNotifications ? tintColor : "#f4f3f4"}
              />
            </View>
          </ThemedView>
        </>
      )}

      <ThemedView style={styles.section}>
        <ThemedText type="default" style={styles.infoText}>
          Notifications are stored locally on your device. They will be checked when you open the app.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

interface FrequencyOptionProps {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  borderColor: string;
  tintColor: string;
  last?: boolean;
}

function FrequencyOption({
  label,
  description,
  selected,
  onPress,
  borderColor,
  tintColor,
  last,
}: FrequencyOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.frequencyOption,
        {
          borderColor,
          borderBottomWidth: last ? 0 : 1,
          backgroundColor: selected ? tintColor + "15" : "transparent",
        },
      ]}
    >
      <View style={styles.frequencyContent}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
        <ThemedText type="default" style={styles.frequencyDescription}>
          {description}
        </ThemedText>
      </View>
      <View
        style={[
          styles.radioButton,
          {
            borderColor: tintColor,
            backgroundColor: selected ? tintColor : "transparent",
          },
        ]}
      >
        {selected && <View style={[styles.radioButtonInner, { backgroundColor: "#fff" }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flex: 1,
    marginRight: 12,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  frequencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  frequencyContent: {
    flex: 1,
  },
  frequencyDescription: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.5,
    lineHeight: 18,
    textAlign: "center",
  },
});
