/**
 * Svelte 组件声明文件
 * 解决 TypeScript 识别 .svelte 文件的问题
 */
declare module '*.svelte' {
  import type { ComponentType } from 'svelte';
  const component: ComponentType<any>;
  export default component;
} 