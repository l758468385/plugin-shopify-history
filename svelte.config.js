/** @type {import('@sveltejs/kit').Config} */
const config = {
  onwarn: (warning, handler) => {
    // 忽略所有 a11y 相关警告
    if (warning.code.startsWith('a11y-')) {
      return;
    }
    handler(warning);
  }
};

export default config;
