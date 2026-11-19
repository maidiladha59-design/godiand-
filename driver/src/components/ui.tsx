import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, hardShadow, radius, space } from "@/lib/theme";
import { useState, type ReactNode } from "react";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              colors={[colors.brand600]}
              onRefresh={onRefresh}
              refreshing={refreshing}
              tintColor={colors.brand600}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ScreenTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.screenTitle}>
      <Text style={styles.screenTitleText}>{title}</Text>
      {subtitle ? (
        <Text style={styles.screenTitleSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function BrandHeader() {
  return (
    <View style={styles.brandHeader}>
      <Text style={styles.wordmark}>Godiand Driver</Text>
      <Text style={styles.tagline}>
        Antar pesanan, bantu warga Banda Aceh.
      </Text>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
  center?: boolean;
  editable?: boolean;
} & Pick<
  TextInputProps,
  | "keyboardType"
  | "autoCapitalize"
  | "autoComplete"
  | "autoCorrect"
  | "maxLength"
  | "textContentType"
  | "inputMode"
  | "autoFocus"
  | "multiline"
  | "numberOfLines"
>;

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  center = false,
  editable = true,
  ...inputProps
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCorrect={false}
        editable={editable}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.ink500}
        style={[
          styles.input,
          focused && styles.inputFocused,
          center && styles.inputCenter,
          !editable && styles.inputDisabled,
          inputProps.multiline && styles.inputMultiline,
        ]}
        value={value}
        {...inputProps}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !inactive && styles.primaryButtonPressed,
        inactive && styles.primaryButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.primaryButtonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function DangerButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        styles.dangerButton,
        pressed && !inactive && styles.primaryButtonPressed,
        inactive && styles.primaryButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.primaryButtonLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && !disabled && styles.secondaryButtonPressed,
        disabled && styles.primaryButtonDisabled,
      ]}
    >
      <Text style={styles.secondaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={styles.errorNote}>
      <Text style={styles.errorNoteText}>{message}</Text>
    </View>
  );
}

export function InfoNote({ message }: { message: string }) {
  return (
    <View style={styles.infoNote}>
      <Text style={styles.infoNoteText}>{message}</Text>
    </View>
  );
}

export function Loading({ label = "Sebentar ya..." }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.brand600} size="large" />
      <Text style={styles.loadingLabel}>{label}</Text>
    </View>
  );
}

export type BadgeTone = "mint" | "sun" | "coral" | "brand";

export function Badge({
  label,
  tone = "mint",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <View style={[styles.badge, badgeStyles[tone].container]}>
      <Text style={[styles.badgeText, badgeStyles[tone].text]}>{label}</Text>
    </View>
  );
}

const badgeStyles: Record<
  BadgeTone,
  { container: ViewStyle; text: TextStyle }
> = {
  mint: {
    container: { backgroundColor: colors.mint50 },
    text: { color: colors.mint700 },
  },
  sun: {
    container: { backgroundColor: colors.sun50 },
    text: { color: colors.ink900 },
  },
  coral: {
    container: { backgroundColor: colors.coral50 },
    text: { color: colors.coral700 },
  },
  brand: {
    container: { backgroundColor: colors.brand50 },
    text: { color: colors.brand700 },
  },
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    gap: space.lg,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },
  screenTitle: {
    gap: 4,
  },
  screenTitleText: {
    color: colors.ink900,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  screenTitleSubtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  brandHeader: {
    gap: space.xs,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.ink900,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink600,
  },
  card: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    padding: space.xl,
    gap: space.lg,
    ...hardShadow,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink900,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink900,
  },
  inputFocused: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand50,
  },
  inputCenter: {
    textAlign: "center",
    letterSpacing: 6,
    fontSize: 22,
    fontWeight: "800",
  },
  inputDisabled: {
    backgroundColor: colors.mist,
    color: colors.ink600,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink600,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
    ...hardShadow,
  },
  primaryButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 1,
    elevation: 2,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },
  dangerButton: {
    backgroundColor: colors.coral600,
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.sun50,
  },
  secondaryButtonLabel: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  errorNote: {
    borderWidth: 2,
    borderColor: colors.coral600,
    borderRadius: radius.sm,
    backgroundColor: colors.coral50,
    padding: space.md,
  },
  errorNoteText: {
    color: colors.coral700,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  infoNote: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.sun50,
    padding: space.md,
  },
  infoNoteText: {
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
    padding: space.xl,
  },
  loadingLabel: {
    color: colors.ink600,
    fontSize: 14,
    textAlign: "center",
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
