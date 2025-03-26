import path from "path";
import fs from "fs";

// 获取当前脚本文件的绝对路径
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// 读取版本号和完整性哈希
export const readVersionAndIntegrity = (
  filePath = "dist/version_integrity.txt"
) => {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf8").trim();
    const [version, integrity, randomSuffix] = data.split(",");
    if (!version || !integrity) {
      throw new Error("version_integrity.txt 格式不正确");
    }
    return { version, integrity, randomSuffix };
  } catch (error) {
    console.error("读取 version_integrity.txt 出错:", error);
    process.exit(1);
  }
};

// 构建自定义代码的路径
export const constructScriptTag = (
  branchName,
  version,
  integrity,
  randomSuffix
) => {
  const baseUrl = "https://cartsee-apps.thecloudcdn.com";
  let targetPath;

  if (branchName.startsWith("feature/")) {
    targetPath = `${baseUrl}/${branchName}/${randomSuffix}/index.js`;
  } else if (branchName === "staging") {
    targetPath = `${baseUrl}/staging/v${version}/index.js`;
  } else {
    targetPath = `${baseUrl}/v${version}/index.js`;
  }

  return `<script defer src="${targetPath}" integrity="${integrity}" crossorigin="anonymous"></script>`;
};

const main = async () => {
  const [, , branchName] = process.argv;
  const { version, integrity, randomSuffix } = readVersionAndIntegrity();
  const code = constructScriptTag(branchName, version, integrity, randomSuffix);
  console.log("自定义代码:", code);
};

main();
