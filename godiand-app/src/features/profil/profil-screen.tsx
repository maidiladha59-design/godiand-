import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppScreen } from "@/components/app-screen";
import {
  Card,
  DangerButton,
  ErrorNote,
  SecondaryButton,
} from "@/components/ui";
import { useMyProfile } from "@/lib/profile";
import { useSession } from "@/lib/session";
import {
  legalLinks,
  support,
  whatsappLink,
} from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { colors, hardShadow, radius, space } from "@/lib/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type MenuItemProps = {
  icon: IoniconName;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  first?: boolean;
  chevron?: boolean;
};

function MenuItem({
  icon,
  label,
  value,
  onPress,
  danger = false,
  first = false,
  chevron = true,
}: MenuItemProps) {
  const content = (
    <>
      <View style={[styles.itemIcon, danger && styles.itemIconDanger]}>
        <Ionicons
          color={danger ? colors.coral700 : colors.brand700}
          name={icon}
          size={18}
        />
      </View>
      <Text style={[styles.itemLabel, danger && styles.itemLabelDanger]}>
        {label}
      </Text>
      {value ? <Text style={styles.itemValue}>{value}</Text> : null}
      {chevron ? <Text style={styles.itemChevron}>›</Text> : null}
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.item, !first && styles.itemDivider]}>{content}</View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        !first && styles.itemDivider,
        pressed && styles.itemPressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

export function ProfilScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { profile, loading, error, reload } = useMyProfile();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [linkError, setLinkError] = useState("");
  const firstFocus = useRef(true);

  // Muat ulang setelah kembali dari halaman Data diri.
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      void reload();
    }, [reload]),
  );

  const metadataName = session?.user.user_metadata?.name;
  const email = session?.user.email ?? profile?.email ?? "-";
  const fallbackName =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : (session?.user.email?.split("@")[0] ?? "Warga Banda Aceh");
  const displayName = profile?.name?.trim() || fallbackName;
  const phone = profile?.phone?.trim() || null;
  const phoneText = loading && !profile ? "Memuat..." : (phone ?? "Belum diisi");
  const initial = displayName.charAt(0).toUpperCase() || "G";
  const version = Constants.expoConfig?.version ?? "0.1.0";

  function openUrl(url: string, label: string) {
    setLinkError("");
    Linking.openURL(url).catch(() => {
      setLinkError(`Tautan ${label} belum bisa dibuka di perangkat ini.`);
    });
  }

  async function signOut() {
    if (!supabase || signingOut) return;

    setSigningOut(true);

    try {
      await supabase.auth.signOut();
    } catch {
      // Tetap arahkan ke halaman masuk.
    }

    router.replace("/masuk");
  }

  return (
    <AppScreen active="profil">
      <Text style={styles.title}>Profil</Text>

      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.heroText}>
            <Text numberOfLines={1} style={styles.heroName}>
              {displayName}
            </Text>
            <Text numberOfLines={1} style={styles.heroEmail}>
              {email}
            </Text>
          </View>
        </View>
        <View style={styles.heroMeta}>
          <View style={styles.heroMetaText}>
            <Text style={styles.heroMetaLabel}>Nomor HP</Text>
            <Text style={styles.heroMetaValue}>{phoneText}</Text>
          </View>
          {loading ? <ActivityIndicator color={colors.white} /> : null}
        </View>
      </Card>

      {error ? (
        <Card>
          <ErrorNote message={error} />
          <SecondaryButton
            label="Coba lagi"
            onPress={() => {
              void reload();
            }}
          />
        </Card>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Akun</Text>
        <Card style={styles.menuCard}>
          <MenuItem
            first
            icon="person-outline"
            label="Data diri"
            onPress={() => router.push("/profil/data-diri")}
          />
          <MenuItem
            danger
            icon="trash-outline"
            label="Hapus akun"
            onPress={() => router.push("/profil/hapus")}
          />
        </Card>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Bantuan</Text>
        <Card style={styles.menuCard}>
          <MenuItem
            first
            icon="logo-whatsapp"
            label="Hubungi admin"
            onPress={() => openUrl(whatsappLink(), "WhatsApp admin")}
            value="WhatsApp"
          />
          <MenuItem
            icon="warning-outline"
            label="Darurat SOS"
            onPress={() => router.push("/profil/sos")}
            value={support.emergencyNumber}
          />
        </Card>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Tentang</Text>
        <Card style={styles.menuCard}>
          <MenuItem
            first
            icon="document-text-outline"
            label="Syarat layanan"
            onPress={() => openUrl(legalLinks.terms, "Syarat layanan")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Kebijakan privasi"
            onPress={() => openUrl(legalLinks.privacy, "Kebijakan privasi")}
          />
          <MenuItem
            chevron={false}
            icon="information-circle-outline"
            label="Versi aplikasi"
            value={`v${version}`}
          />
        </Card>
      </View>

      {linkError ? <ErrorNote message={linkError} /> : null}

      <Card>
        {confirmingSignOut ? (
          <>
            <Text style={styles.confirmText}>
              Yakin mau keluar dari GoDiand? Kamu bisa masuk lagi pakai email.
            </Text>
            <View style={styles.confirmRow}>
              <View style={styles.confirmCol}>
                <SecondaryButton
                  disabled={signingOut}
                  label="Batal"
                  onPress={() => setConfirmingSignOut(false)}
                />
              </View>
              <View style={styles.confirmCol}>
                <DangerButton
                  label="Ya, keluar"
                  loading={signingOut}
                  onPress={() => {
                    void signOut();
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <DangerButton
            label="Keluar"
            onPress={() => setConfirmingSignOut(true)}
          />
        )}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  hero: {
    backgroundColor: colors.brand600,
    gap: space.md,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.sun400,
  },
  avatarText: {
    color: colors.ink900,
    fontSize: 24,
    fontWeight: "900",
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
  },
  heroEmail: {
    color: colors.brand100,
    fontSize: 13,
    lineHeight: 19,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand700,
    paddingTop: space.md,
  },
  heroMetaText: {
    gap: 2,
  },
  heroMetaLabel: {
    color: colors.brand100,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroMetaValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
  group: {
    gap: space.sm,
  },
  groupLabel: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginLeft: space.xs,
  },
  menuCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
  },
  itemPressed: {
    backgroundColor: colors.sun50,
  },
  itemIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.brand50,
  },
  itemIconDanger: {
    backgroundColor: colors.coral50,
  },
  itemLabel: {
    flex: 1,
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  itemLabelDanger: {
    color: colors.coral700,
  },
  itemValue: {
    color: colors.ink500,
    fontSize: 13,
    fontWeight: "700",
  },
  itemChevron: {
    color: colors.ink500,
    fontSize: 20,
    fontWeight: "800",
  },
  confirmText: {
    color: colors.ink700,
    fontSize: 14,
    lineHeight: 21,
  },
  confirmRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  confirmCol: {
    flex: 1,
  },
});
