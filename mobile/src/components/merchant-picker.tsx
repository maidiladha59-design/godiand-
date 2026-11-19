import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PickerModal } from "@/components/picker-modal";
import type { Merchant } from "@/lib/data/merchants";
import { colors, radius, space } from "@/lib/theme";

export function MerchantPicker({
  merchants,
  value,
  onChange,
}: {
  merchants: Merchant[];
  value: string | null;
  onChange: (merchantId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = merchants.find((merchant) => merchant.id === value) ?? null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Toko</Text>

      <Pressable
        accessibilityLabel={`Toko: ${selected ? selected.name : "belum dipilih"}`}
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
            {selected ? selected.name : "Pilih toko"}
          </Text>
          {selected?.address ? (
            <Text style={styles.address}>{selected.address}</Text>
          ) : null}
        </View>
        <Text style={styles.caret}>▾</Text>
      </Pressable>

      <PickerModal onClose={() => setOpen(false)} title="Pilih toko" visible={open}>
        {merchants.length === 0 ? (
          <Text style={styles.empty}>Belum ada toko aktif.</Text>
        ) : (
          merchants.map((merchant) => {
            const active = merchant.id === value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={merchant.id}
                onPress={() => {
                  onChange(merchant.id);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{merchant.name}</Text>
                  {merchant.description ? (
                    <Text style={styles.optionDescription}>
                      {merchant.description}
                    </Text>
                  ) : null}
                  {merchant.address ? (
                    <Text style={styles.optionAddress}>{merchant.address}</Text>
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
  optionDescription: {
    color: colors.ink700,
    fontSize: 12,
    lineHeight: 17,
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
