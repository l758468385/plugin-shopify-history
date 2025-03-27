/**
 * 分页服务 - 处理分页相关业务逻辑
 */

import { getPagination } from "./vueService";

/**
 * 重置分页到第1页
 * @returns 是否成功重置
 */
export function resetPagination(): boolean {
  const pagination = getPagination();
  if (!pagination) {
    console.warn("未找到分页组件，无法重置分页");
    return false;
  }
  pagination.handleCurrentChange(1);
  return true;
}
