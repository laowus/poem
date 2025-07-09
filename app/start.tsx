import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function StartScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState(false);
  const router = useRouter();
  const DATABASE_NAME = "poem.db";

  useEffect(() => {
    const checkDatabaseFile = async () => {
      try {
        //判断是否存在数据库文件
        const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
        const sqliteInfo = await FileSystem.getInfoAsync(dbPath);
        if (sqliteInfo.exists) {
          console.log("数据库文件已存在，开始加载");
          setIsDatabaseLoaded(true);
        } else {
          console.log("数据库文件不存在，开始下载");
          const asset = Asset.fromModule(require("@/assets/database/poem.db"));
          await asset.downloadAsync();
          await FileSystem.copyAsync({
            from: asset.localUri!,
            to: dbPath,
          }).then(() => {
            console.log("数据库文件复制成功:", dbPath);
            setIsDatabaseLoaded(true);
          });
        }
      } catch (error) {
        console.error("检查数据库文件时出错:", error);
        setIsDatabaseLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkDatabaseFile();
  }, []);

  useEffect(() => {
    if (!isLoading && isDatabaseLoaded) {
      router.push("/(tabs)");
    }
  }, [isLoading, isDatabaseLoaded, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>正在加载...</Text>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {!isLoading && !isDatabaseLoaded && (
        <Text style={styles.error}>数据库加载失败</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
  },
});
