<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { vueManager } from "../utils/vueInstanceManager";

  // Props
  export let activeTab = "new-order";

  // 状态管理
  let showNewOrderTooltip = false;
  let showOldOrderTooltip = false;

  // 事件分发器
  const dispatch = createEventDispatcher();

  // 处理标签点击
  function handleTabClick(tabId: string) {
    if (activeTab !== tabId) {
      activeTab = tabId;

      // 触发自定义事件
      dispatch("tabChange", { tab: tabId });

      // 重置分页到第一页
      vueManager.resetPaginationToFirstPage();
    }
  }
</script>

<div class="order-history-tabs">
  <div class="tab-container">
    <div
      class="tab-item {activeTab === 'new-order' ? 'active' : ''}"
      on:click={() => handleTabClick("new-order")}
      data-tab="new-order"
    >
      <span class="tab-text">New Order</span>
      <div
        class="info-icon"
        on:mouseenter={() => (showNewOrderTooltip = true)}
        on:mouseleave={() => (showNewOrderTooltip = false)}
      >
        !
      </div>
      {#if showNewOrderTooltip}
        <div class="tooltip">Create a new order</div>
      {/if}
    </div>

    <div
      class="tab-item {activeTab === 'old-order' ? 'active' : ''}"
      on:click={() => handleTabClick("old-order")}
      data-tab="old-order"
    >
      <span class="tab-text">Order History</span>
      <div
        class="info-icon"
        on:mouseenter={() => (showOldOrderTooltip = true)}
        on:mouseleave={() => (showOldOrderTooltip = false)}
      >
        !
      </div>
      {#if showOldOrderTooltip}
        <div class="tooltip">View order history</div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .order-history-tabs {
    .tab-container {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }

    .tab-item {
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      cursor: pointer;
      user-select: none;
      border: 1px solid #e1e3e5;
      transition: all 0.2s ease;

      &.active {
        background-color: #42474b;
        border-color: #42474b;
        color: white;
      }

      &:not(.active) {
        background-color: white;
        color: #42474b;

        &:hover {
          background-color: #f6f6f7;
        }
      }
    }

    .tab-text {
      margin-right: 4px;
      font-size: 14px;
      font-weight: 500;
    }

    .info-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      font-size: 10px;
      transition: all 0.2s ease;
      border: 1px solid currentColor;
      color: currentColor;
      text-align: center;
      line-height: 16px;
      cursor: help;

      &:hover {
        opacity: 0.8;
      }
    }

    .tooltip {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
      color: #42474b;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #e1e3e5;
      z-index: 1000;

      &::before {
        content: "";
        position: absolute;
        top: -5px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background: white;
        border-left: 1px solid #e1e3e5;
        border-top: 1px solid #e1e3e5;
      }
    }
  }
</style>
