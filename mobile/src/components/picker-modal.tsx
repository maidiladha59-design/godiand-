import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, space } from "@/lib/theme";

export function PickerModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityLabel="Tutup pilihan"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.close,
                pressed && styles.closePressed,
              ]}
            >
              <Text style={styles.closeText}>Tutup</Text>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.list}
            style={styles.scroll}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 28, 38, 0.55)",
    justifyContent: "center",
    padding: space.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: space.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.ink900,
    backgroundColor: colors.brand50,
  },
  title: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  close: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  closePressed: {
    backgroundColor: colors.sun50,
  },
  closeText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "800",
  },
  scroll: {
    maxHeight: 420,
  },
  list: {
    padding: space.md,
    gap: space.sm,
  },
});
