import type { ReactNode } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav, type TabKey } from "@/components/bottom-nav";
import { colors, space } from "@/lib/theme";

export function AppScreen({
  active,
  children,
}: {
  active: TabKey;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {children}
      </ScrollView>
      <BottomNav active={active} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xl,
    gap: space.lg,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
});
