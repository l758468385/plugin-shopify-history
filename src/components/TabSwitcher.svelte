<script lang="ts">
  import { onMount } from "svelte";
  import { EventHandler } from "../services/OrderService";
  import { StateManager } from "../services/StateManager";

  // Props
  export let activeTab = "new-order";

  // 元素引用
  let containerElement: HTMLElement;

  // 生命周期
  onMount(() => {
    // 初始化标签切换
    EventHandler.setupTabEvents(containerElement);

    // 设置当前状态
    StateManager.setCurrentTab(activeTab as "new-order" | "old-order");
  });

  // 处理标签切换
  function handleTabClick(tab: "new-order" | "old-order") {
    activeTab = tab;
    StateManager.setCurrentTab(tab);
  }
</script>

<div class="order-history-tabs" bind:this={containerElement}>
  <div class="tab-container">
    <a
      href="javascript:;"
      class="order-tab {activeTab === 'new-order' ? 'active' : ''}"
      data-tab="new-order"
      on:click={() => handleTabClick("new-order")}
    >
      New Order
    </a>
    <a
      href="javascript:;"
      class="order-tab {activeTab === 'old-order' ? 'active' : ''}"
      data-tab="old-order"
      on:click={() => handleTabClick("old-order")}
    >
      Old Order
    </a>
  </div>
</div>

<style lang="scss">
  .order-history-tabs {
    margin-bottom: 20px;

    .tab-container {
      display: flex;
      margin-bottom: 20px;
    }

    .order-tab {
      padding: 10px 20px;
      text-decoration: none;
      margin-right: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      transition: all 0.3s ease;

      &.active {
        background-color: #333;
        color: #fff;
        border-color: #333;
      }

      &:not(.active) {
        background-color: #fff;
        color: #333;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }
  }
</style>
