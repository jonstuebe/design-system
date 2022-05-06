import { useMemo } from "react";
import { ActionSheetIOS, ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Dinero from "dinero.js";
import { getFirestore, collection, query, where, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, signOut } from "firebase/auth";
import { lighten } from "polished";

import { app } from "../firebase";

import { useTheme } from "../theme";
import { getItemAmount } from "../utils";

import ActionSheetButton from "../components/ActionSheetButton";
import { Text } from "../components/Text";
import SavingsCard from "../components/SavingsCard";
import Button from "../components/Button";

import { RootStackParamList, SavingsItem, SavingsItemAmount } from "../types";
import { ScrollView } from "react-native-gesture-handler";

export default function Home() {
  const { colors } = useTheme();
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();

  const [user] = useAuthState(getAuth(app));
  const [value, loading, error] = useCollection(
    query(
      collection(getFirestore(app), "items-v2"),
      where("uid", "==", user?.uid),
      orderBy("goal", "asc")
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const data = useMemo(() => {
    const items: SavingsItem[] = [];

    if (!loading && !error) {
      value?.docs.map((doc) => {
        const itemData = doc.data();

        items.push({
          id: doc.id,
          amounts: [] as SavingsItemAmount[],
          ...itemData,
        } as SavingsItem);
      });
    }

    return items;
  }, [error, loading, value?.docs]);

  const totalSaved = useMemo(() => {
    const amount = data.reduce((acc, cur) => {
      return acc + getItemAmount(cur);
    }, 0);

    const value = Dinero({ amount: amount * 100, currency: "USD" });

    return value.hasSubUnits() ? value.toFormat("$0,0.00") : value.toFormat("$0,0");
  }, [data]);

  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{ flex: 1, position: "relative" }}
      >
        {/* <LinearGradient
          colors={["rgb(0,0,0)", "rgb(0,0,0)", "rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]}
          locations={[0, 0.6, 0.8, 1]}
          style={{
            alignItems: "center",
            paddingTop: 96 + insets.top,
            paddingBottom: 96,
          }}
        >
          <Text size={24} weight="medium" color="textDim">
            Total Saved
          </Text>
          <Text size={48} weight="semibold" color="text">
            {totalSaved}
          </Text>
        </LinearGradient> */}
        <View
          style={{
            borderRadius: 8,
            overflow: "hidden",
            marginHorizontal: 16,
          }}
        >
          {data
            .concat(data)
            .concat(data)
            .map((item, index) => {
              return (
                <SavingsCard
                  key={index}
                  item={item}
                  style={
                    index + 1 < data.length
                      ? {
                          borderBottomColor: colors.border,
                          borderBottomWidth: 1,
                        }
                      : undefined
                  }
                />
              );
            })}
        </View>
      </ScrollView>
      {/* <View
        style={{
          position: "absolute",
          top: insets.top > 0 ? insets.top : 12,
          right: 12,

          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigate("AddItem");
          }}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,
            marginRight: 8,
          }}
        >
          <Ionicons name="add-circle-outline" size={32} color={colors.textDim} />
        </Pressable>
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            ActionSheetIOS.showActionSheetWithOptions(
              {
                options: ["Logout", "Cancel"],
                destructiveButtonIndex: 0,
                cancelButtonIndex: 1,
                userInterfaceStyle: "dark",
              },
              async (buttonIndex) => {
                if (buttonIndex === 0) {
                  await signOut(getAuth(app));
                }
              }
            );
          }}
        >
          {({ pressed }) => (
            <Ionicons
              name="ellipsis-vertical-circle-outline"
              color={pressed ? lighten(0.1, colors.textDim) : colors.textDim}
              size={32}
            />
          )}
        </Pressable>
      </View> */}
    </>
  );
}
