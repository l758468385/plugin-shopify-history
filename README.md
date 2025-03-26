# Shopify 历史订单插件

这是一个基于 Svelte 和 TypeScript 的 Shopify 历史订单插件，可以独立维护并集成到商城项目中。

## 功能特性

- 历史订单/新订单标签页切换
- 订单详情弹窗展示
- 完整的订单数据解析和展示
- 响应式设计，支持移动端和桌面端

## 技术栈

- TypeScript
- Svelte
- SASS
- Vite

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

构建后的文件位于 `dist` 目录下。

## 集成到商城项目

将构建后的 JS 文件引入到商城项目中：

```html
<script src="path/to/shopify-history.js"></script>
```

在商城项目中需要确保有对应的扩展点：

```html
<div id="order-history-tabs"></div>
```

并初始化扩展点：

```javascript
window.UIExtensionPointSimpleMgr = {
  extend: function(name, callback) {
    if (name === 'order-history-tabs') {
      const container = document.getElementById('order-history-tabs');
      if (container) {
        callback(container);
      }
    }
  }
};
```

## API 参考

### ShopifyHistoricalOrders

全局对象，提供了插件的主要功能。

#### 方法

- `initUIExtension()`: 初始化UI扩展点

#### 事件

插件使用自定义事件进行通信：

- `shopify-history:order-loaded`: 当订单数据加载完成时触发，携带订单数据

## 许可证

MIT
