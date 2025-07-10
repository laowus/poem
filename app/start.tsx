import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { unzip } from "react-native-zip-archive";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function StartScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState(false);
  const router = useRouter();
  const DATABASE_NAME = "poem.db";
  const ZIP_FILE_NAME = "poem.zip";
  const dbPath = `${FileSystem.documentDirectory}files/SQLite/${DATABASE_NAME}`;
  const zipFilePath = `${FileSystem.documentDirectory}files/${ZIP_FILE_NAME}`;

  const fileExist = async (filePath: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        console.log(`文件 ${filePath} 存在，大小为: ${fileInfo.size} 字节`);
      }
      return fileInfo.exists;
    } catch (error) {
      console.log("检查文件是否存在时出错:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkDatabaseFile = async () => {
      try {
        const exist = await fileExist(dbPath);
        if (exist) {
          console.log("数据库文件已存在，开始加载");
          setIsDatabaseLoaded(true);
        } else {
          try {
            const asset = Asset.fromModule(
              require("@/assets/database/poem.zip")
            );
            await asset.downloadAsync();
            const fileInfo = await FileSystem.getInfoAsync(asset.localUri!);
            if (fileInfo.exists && fileInfo.size) {
              console.log("zip 文件大小:", fileInfo.size);
            } else {
              console.log("zip 文件不存在或无法获取大小");
            }
            await FileSystem.copyAsync({
              from: asset.localUri || asset.uri,
              to: zipFilePath,
            });
            console.log("zip 文件复制成功:", zipFilePath);

            // 使用 react-native-zip-archive 解压文件
            const unzipResult = await unzip(
              zipFilePath,
              `${FileSystem.documentDirectory}files/SQLite/`
            );
            console.log("解压成功，解压路径为:", unzipResult);

            const dbFileExist = await fileExist(dbPath);
            if (dbFileExist) {
              console.log("数据库文件解压成功:", dbPath);
              setIsDatabaseLoaded(true);
            } else {
              console.log("数据库文件解压失败:", dbPath);
              setIsDatabaseLoaded(false);
            }
          } catch (assetError) {
            console.log("zip 文件加载失败:", assetError);
            setIsDatabaseLoaded(false);
          }
        }
      } catch (error) {
        console.log("数据库文件检查错误:", error);
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
