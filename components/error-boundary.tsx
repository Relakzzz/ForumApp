import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error caught:", error);
    console.error("[ErrorBoundary] Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Something went wrong
          </ThemedText>
          <ThemedText style={styles.message}>
            {this.state.error?.message || "An unexpected error occurred"}
          </ThemedText>
          <ThemedText style={styles.details} numberOfLines={5}>
            {this.state.error?.stack}
          </ThemedText>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  details: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "left",
    fontFamily: "monospace",
  },
});
