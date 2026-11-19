import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { PickedPlace, Place } from "@/lib/places";
import { colors, radius, space } from "@/lib/theme";

type PickerAction = {
  label: string;
  busyLabel?: string;
  busy?: boolean;
  onPress: () => void;
};

export function PlacePicker({
  label,
  placeholder,
  hint,
  value,
  places,
  onChange,
  action,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  value: PickedPlace | null;
  places: Place[];
  onChange: (value: PickedPlace | null) => void;
  action?: PickerAction;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
      setOpen(false);
    }
  }, [value]);

  const keyword = query.trim().toLowerCase();
  const suggestions =
    open && keyword.length >= 2
      ? places
          .filter((place) =>
            `${place.name} ${place.address ?? ""}`
              .toLowerCase()
              .includes(keyword),
          )
          .slice(0, 5)
      : [];

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCorrect={false}
        onBlur={() => setFocused(false)}
        onChangeText={(text) => {
          setQuery(text);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => {
          setFocused(true);
          setOpen(true);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.ink500}
        style={[styles.input, focused && styles.inputFocused]}
        value={query}
      />

      {value && query === value.name ? (
        <Text style={styles.selected} numberOfLines={2}>
          {value.address ?? "Titik dipilih"}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map((place) => (
            <Pressable
              accessibilityRole="button"
              key={`${place.slug}-${place.name}`}
              onPress={() => {
                onChange({
                  name: place.name,
                  address: place.address,
                  latitude: place.latitude,
                  longitude: place.longitude,
                });
                setQuery(place.name);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.suggestion,
                pressed && styles.suggestionPressed,
              ]}
            >
              <Text style={styles.suggestionName}>{place.name}</Text>
              {place.address ? (
                <Text style={styles.suggestionAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {action ? (
        <Pressable
          accessibilityRole="button"
          disabled={action.busy}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionText}>
            {action.busy
              ? (action.busyLabel ?? "Mencari lokasi...")
              : action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
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
  hint: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  selected: {
    color: colors.mint700,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  suggestions: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  suggestion: {
    paddingHorizontal: space.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
    gap: 2,
  },
  suggestionPressed: {
    backgroundColor: colors.sun50,
  },
  suggestionName: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "800",
  },
  suggestionAddress: {
    color: colors.ink600,
    fontSize: 12,
  },
  action: {
    alignSelf: "flex-start",
    minHeight: 36,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.sun400,
    paddingHorizontal: space.md,
  },
  actionPressed: {
    opacity: 0.75,
  },
  actionText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "900",
  },
});
