import AsyncStorage from "@react-native-async-storage/async-storage";
let mmkv: any;
try {
  mmkv = require("react-native-mmkv").createMMKV({
    id: "audio-mastery-preferences",
  });
} catch {
  mmkv = null;
}
export const storage = {
  get: async (key: string): Promise<string | null> =>
    mmkv ? (mmkv.getString(key) ?? null) : AsyncStorage.getItem(key),
  set: async (key: string, value: string) => {
    if (mmkv) mmkv.set(key, value);
    else await AsyncStorage.setItem(key, value);
  },
};
