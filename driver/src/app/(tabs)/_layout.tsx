import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { Loading } from "@/components/ui";
import { useDriver } from "@/lib/driver";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

function TabDot({ color }: { color: ColorValue }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

export default function DriverTabsLayout() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading } = useDriver();

  if (sessionLoading) {
    return <Loading label="Menyiapkan Godiand Driver..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (driverLoading) {
    return <Loading label="Memuat akun driver..." />;
  }

  if (!driver) {
    return <Redirect href="/daftar" />;
  }

  if (!driver.is_verified) {
    return <Redirect href="/verifikasi" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand600,
        tabBarInactiveTintColor: colors.ink500,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
      <Tabs.Screen
        name="cari"
        options={{
          title: "Cari",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
      <Tabs.Screen
        name="akun"
        options={{
          title: "Akun",
          tabBarIcon: ({ color }) => <TabDot color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
    backgroundColor: colors.white,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
  },
  tabItem: {
    paddingVertical: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.ink900,
  },
});
