import { useEffect, useRef, useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/components/page-header";
import { Card, ErrorNote, Loading } from "@/components/ui";
import { useDriver } from "@/lib/driver";
import { loadMessages, sendMessage, type ChatMessage } from "@/lib/data/chat";
import { formatTime } from "@/lib/format";
import { useSession } from "@/lib/session";
import { colors, radius, space } from "@/lib/theme";

export default function ChatScreen() {
  const { session, loading } = useSession();
  const { driver, loading: driverLoading } = useDriver();
  const params = useLocalSearchParams<{ orderId?: string }>();

  if (loading || driverLoading) {
    return <Loading label="Menyiapkan chat..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!driver) {
    return <Redirect href="/daftar" />;
  }

  if (!driver.is_verified) {
    return <Redirect href="/verifikasi" />;
  }

  if (!params.orderId) {
    return <Redirect href="/" />;
  }

  return <ChatContent orderId={params.orderId} userId={session.user.id} />;
}

function ChatContent({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function poll(initial: boolean) {
      const result = await loadMessages(orderId);

      if (!active) return;

      setMessages(result.messages);
      setError(result.error ?? "");

      if (initial) {
        setLoadingData(false);
      }
    }

    poll(true);
    const timer = setInterval(() => poll(false), 4000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId]);

  async function handleSend() {
    if (sending) return;

    const text = input.trim();

    if (!text) return;

    setSending(true);
    setError("");

    const result = await sendMessage({
      orderId,
      senderId: userId,
      message: text,
    });

    if (result.error) {
      setError(result.error);
      setSending(false);
      return;
    }

    setInput("");

    const refreshed = await loadMessages(orderId);
    setMessages(refreshed.messages);
    setSending(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <PageHeader
              subtitle="Pesan hanya untuk pesanan ini."
              title="Chat pelanggan"
            />
          </View>

          {error ? (
            <View style={styles.errorWrap}>
              <ErrorNote message={error} />
            </View>
          ) : null}

          {loadingData ? (
            <Loading label="Memuat pesan..." />
          ) : (
            <ScrollView
              contentContainerStyle={styles.messages}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: false })
              }
              ref={scrollRef}
            >
              {messages.length === 0 ? (
                <Card>
                  <Text style={styles.emptyTitle}>Belum ada pesan.</Text>
                  <Text style={styles.emptyText}>
                    Tulis sapaan ke pelanggan kapan saja.
                  </Text>
                </Card>
              ) : (
                messages.map((message) => {
                  const mine = message.sender_id === userId;

                  if (message.sender_role === "system") {
                    return (
                      <View key={message.id} style={styles.systemRow}>
                        <Text style={styles.systemText}>
                          {message.message}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.bubbleRow,
                        mine ? styles.bubbleRowMine : styles.bubbleRowOther,
                      ]}
                    >
                      <View
                        style={[
                          styles.bubble,
                          mine ? styles.bubbleMine : styles.bubbleOther,
                        ]}
                      >
                        <Text
                          style={[
                            styles.bubbleAuthor,
                            mine ? styles.bubbleAuthorMine : null,
                          ]}
                        >
                          {mine ? "Kamu" : "Pelanggan"}
                        </Text>
                        <Text
                          style={[
                            styles.bubbleText,
                            mine ? styles.bubbleTextMine : null,
                          ]}
                        >
                          {message.message}
                        </Text>
                        <Text
                          style={[
                            styles.bubbleTime,
                            mine ? styles.bubbleTimeMine : null,
                          ]}
                        >
                          {formatTime(message.created_at)}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}

          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Tulis pesan"
              editable={!sending}
              maxLength={2000}
              multiline
              onChangeText={(value) => {
                setInput(value);
                setError("");
              }}
              placeholder="Tulis pesan..."
              placeholderTextColor={colors.ink500}
              style={styles.input}
              value={input}
            />
            <Pressable
              accessibilityLabel="Kirim pesan"
              accessibilityRole="button"
              accessibilityState={{
                disabled: sending || input.trim().length === 0,
              }}
              disabled={sending || input.trim().length === 0}
              onPress={handleSend}
              style={({ pressed }) => [
                styles.send,
                pressed && styles.sendPressed,
                (sending || input.trim().length === 0) && styles.sendDisabled,
              ]}
            >
              <Text style={styles.sendText}>
                {sending ? "..." : "Kirim"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  errorWrap: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  messages: {
    padding: space.lg,
    gap: space.sm,
  },
  emptyTitle: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  systemRow: {
    alignItems: "center",
  },
  systemText: {
    color: colors.ink600,
    fontSize: 12,
    textAlign: "center",
    backgroundColor: colors.mist,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubbleRowOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: colors.brand600,
  },
  bubbleOther: {
    backgroundColor: colors.white,
  },
  bubbleAuthor: {
    color: colors.ink600,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bubbleAuthorMine: {
    color: colors.brand100,
  },
  bubbleText: {
    color: colors.ink900,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  bubbleTime: {
    color: colors.ink500,
    fontSize: 10,
    alignSelf: "flex-end",
  },
  bubbleTimeMine: {
    color: colors.brand100,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: space.sm,
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
    backgroundColor: colors.white,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink900,
  },
  send: {
    minHeight: 44,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.brand600,
    paddingHorizontal: space.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sendPressed: {
    backgroundColor: colors.brand700,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
  },
});
