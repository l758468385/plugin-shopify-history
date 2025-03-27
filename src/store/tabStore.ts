/**
 * Tab状态存储 - 集中管理标签页状态
 */
import { writable } from "svelte/store";

export type TabType = "new-order" | "old-order";

export const activeTab = writable<TabType>("new-order");

export function setActiveTab(tab: TabType): void {
  activeTab.set(tab);
}
