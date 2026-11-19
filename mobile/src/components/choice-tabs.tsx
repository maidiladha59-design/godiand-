import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "@/lib/theme";

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

export function ChoiceTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.ink900,
  },
  label: {
    color: colors.ink600,
    fontSize: 13,
    fontWeight: "800",
  },
  labelActive: {
    color: colors.white,
  },
});
