import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PickerModal } from "@/components/picker-modal";
import type { Place } from "@/lib/data/places";
import { colors, radius, space } from "@/lib/theme";

export function PlacePicker({
  label,
  hint,
  places,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  places: Place[];
  value: string | null;
  onChange: (placeId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = places.find((place) => place.id === value) ?? null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        accessibilityLabel={`${label}: ${selected ? selected.name : "belum dipilih"}`}
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          selected && styles.triggerSelected,
          pressed && styles.triggerPressed,
        ]}
      >
        <View style={styles.triggerText}>
          <Text style={styles.value}>
            {selected ? selected.name : "Pilih lokasi"}
          </Text>
          {selected?.address ? (
            <Text style={styles.address}>{selected.address}</Text>
          ) : null}
        </View>
        <Text style={styles.caret}>▾</Text>
      </Pressable>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <PickerModal
        onClose={() => setOpen(false)}
        title={label}
        visible={open}
      >
        {places.length === 0 ? (
          <Text style={styles.empty}>Belum ada titik lokasi.</Text>
        ) : (
          places.map((place) => {
            const active = place.id === value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={place.id}
                onPress={() => {
                  onChange(place.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{place.name}</Text>
                  {place.address ? (
                    <Text style={styles.optionAddress}>{place.address}</Text>
                  ) : null}
                </View>
                {active ? <Text style={styles.chosen}>Dipilih</Text> : null}
              </Pressable>
            );
          })
        )}
      </PickerModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink900,
    letterSpacing: 0.2,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  triggerSelected: {
    backgroundColor: colors.brand50,
  },
  triggerPressed: {
    backgroundColor: colors.sun50,
  },
  triggerText: {
    flex: 1,
    gap: 2,
  },
  value: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "700",
  },
  address: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  caret: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink600,
  },
  empty: {
    color: colors.ink600,
    fontSize: 13,
    padding: space.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    padding: space.md,
  },
  optionActive: {
    backgroundColor: colors.brand50,
  },
  optionPressed: {
    backgroundColor: colors.sun50,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionName: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "800",
  },
  optionAddress: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  chosen: {
    color: colors.brand700,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
