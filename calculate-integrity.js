import fs from "fs";
import path from "path";
import crypto from "crypto";

// 获取当前脚本文件的绝对路径
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, "dist/shopify-history.js"); // 文件路径
const version = JSON.parse(fs.readFileSync("./package.json", "utf8")).version;

// 计算文件的integrity
const calculateIntegrity = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  // 获取 Base64 编码的哈希值，并按 SRI 规范格式化
  return `sha256-${hash.digest("base64")}`;
};

// 保存版本号和完整性哈希到文件
const saveToFile = (integrity) => {
  const randomSuffix = crypto.randomBytes(3).toString("hex"); // 生成6个字符的随机字符串
  const data = `${version},${integrity},${randomSuffix}`;
  const ws = fs.createWriteStream(
    path.resolve(__dirname, "dist/version_integrity.txt")
  );
  ws.write(data);
  ws.close();
};

// 读取文件内容并保存到后端
const main = async () => {
  const integrity = calculateIntegrity(filePath);
  saveToFile(integrity);
};

main();
