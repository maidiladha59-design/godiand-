import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View, type ColorValue } from "react-native";
import { Loading } from "@/components/ui";
import { useSession } from "@/lib/session";
import { colors } from "@/lib/theme";

function TabDot({ color }: { color: ColorValue }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

export default function AppTabsLayout() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan Godiand..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
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
        name="pesan"
        options={{
          title: "Pesan",
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
