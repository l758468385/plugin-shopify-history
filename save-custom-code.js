import fetch from "node-fetch";
import crypto from "crypto";
import {
  constructScriptTag,
  readVersionAndIntegrity,
} from "./generate-script-tag.js";

const generateHMAC = (message, secretKey) => {
  return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
};

const sendCustomCode = async (code, API_PREFIX, secretKey) => {
  const timestamp = Date.now().toString();
  const message = `code=${code}&timestamp=${timestamp}`;
  const hmac = generateHMAC(message, secretKey);
  console.log("API_PREFIX", API_PREFIX);
  const postData = { code, timestamp, hmac };
  try {
    const response = await fetch(`${API_PREFIX}/api/store/custom_code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    //
    // const responseData = await response.json();
    // console.log('Response:', responseData);
    // return responseData;
  } catch (error) {
    console.error("网络出错:", error);
    process.exit(1);
  }
};

const main = async () => {
  const [, , branchName, API_PREFIX, secretKey] = process.argv;

  if (!API_PREFIX || !secretKey) {
    console.error("缺少必要的参数");
    process.exit(1);
  }

  const { version, integrity, randomSuffix } = readVersionAndIntegrity();
  const code = constructScriptTag(branchName, version, integrity, randomSuffix);

  await sendCustomCode(code, API_PREFIX, secretKey);
};

main();
