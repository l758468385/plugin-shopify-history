/**
 * 订单服务模块 - 处理订单数据和UI展示
 */
import { StateManager, VueManager } from './Core.js'

// 订单数据服务
const OrderData = {
  // 从表格数据中获取订单信息
  getOrderDataFromTable(orderId) {
    // 确保Vue实例存在
    let vueInstance = StateManager.getVueInstance()
    if (!vueInstance) {
      vueInstance = VueManager.findVueInstance()
      if (!vueInstance) return null
    }

    // 从Vue实例中获取订单数据
    if (vueInstance.orders && vueInstance.orders.data) {
      return vueInstance.orders.data.find((order) => order.ID.toString() === orderId)
    }

    return null
  },

  // 通过API获取订单详情
  fetchOrderData(orderId) {
    return new Promise((resolve, reject) => {
      if (!window.shopSDK || !window.shopSDK.io || !window.shopSDK.io.http) {
        reject(new Error('SDK未初始化，无法获取订单数据'))
        return
      }

      window.shopSDK.io.http
        .get(`/api/store/orders/${orderId}`, { errorThrow: false })
        .then((res) => {
          if (res.success) {
            // 数据预处理
            const processedData = this.preprocessOrderData(res.responseBody);
            resolve(processedData)
          } else {
            reject(new Error('获取订单详情失败'))
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // 预处理订单数据，确保字段格式一致
  preprocessOrderData(orderData) {
    if (!orderData) return orderData;

    // 深拷贝避免修改原始数据
    const data = JSON.parse(JSON.stringify(orderData));

    // 处理运费数组
    if (!data.shippings || !data.shippings.length) {
      data.shippings = [];
      if (data.order_shipping) {
        data.shippings.push({
          order_item_name: data.payment_channel_to_store || 'Standard Shipping',
          price: data.order_shipping
        });
      }
    }

    // 处理折扣信息
    if (!data.discount_record || !Array.isArray(data.discount_record)) {
      data.discount_record = [];
      if (data.coupon_code) {
        data.discount_record.push({
          code: data.coupon_code,
          auto_coupon: false
        });
      }
    }

    // 确保line_items存在
    if (!data.line_items) {
      data.line_items = [];
    }

    return data;
  },

  // 通过API获取并显示订单详情
  fetchAndShowOrder(orderId) {
    this.fetchOrderData(orderId)
      .then((data) => {
        // 使用Vue风格的弹窗替代原来的弹窗
        OrderUI.showOrderPopup(data)
      })
      .catch((error) => {
        console.error('获取订单详情出错:', error)
      })
  },
}

// 订单UI服务
const OrderUI = {
  // 创建订单详情弹窗
  showOrderPopup(orderData) {
    console.log('orderData', orderData);
    // 获取Vue实例以使用国际化
    const vueInstance = StateManager.getVueInstance();
    if (!vueInstance) {
      console.error('无法获取Vue实例，国际化功能可能无法正常工作');
      return;
    }

    // 检查是否已存在弹窗元素，如果存在则先移除
    const existingPopup = document.getElementById('order-detail-popup');
    if (existingPopup) {
      document.body.removeChild(existingPopup);
    }

    // 创建弹窗容器
    const popupContainer = document.createElement('div');
    popupContainer.id = 'order-detail-popup';
    popupContainer.className = 'order-popup-overlay';

    // 判断设备类型
    const isMobile = window.innerWidth <= 768;

    // 设置弹窗样式
    popupContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      font-family: var(--text-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif);
    `;

    // 创建弹窗内容
    const popupContent = document.createElement('div');
    popupContent.className = 'order-popup-content';
    popupContent.style.cssText = `
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      max-height: 90vh;
      overflow-y: auto;
      width: ${isMobile ? '95%' : '80%'};
      max-width: ${isMobile ? '100%' : '1000px'};
      padding: ${isMobile ? '15px' : '24px'};
      position: relative;
    `;

    // 创建弹窗头部
    const popupHeader = document.createElement('div');
    popupHeader.className = 'order-popup-header';
    popupHeader.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    `;

    // 创建标题
    const popupTitle = document.createElement('h4');
    popupTitle.textContent = vueInstance.$t ? vueInstance.$t('account.order') + ' #' + (orderData.ID || orderData.id || '') : `订单 #${orderData.ID || orderData.id || ''}`;
    popupTitle.style.cssText = `
      margin: 0;
      font-size: 20px;
      font-weight: 400;
      color: #222A40;
    `;

    // 添加订单时间
    const orderTime = document.createElement('p');
    orderTime.textContent = this.formatDate(orderData.post_date || orderData.created_at || orderData.CreatedAt || '');
    orderTime.style.cssText = `
      font-size: 14px;
      font-weight: 300;
      color: #666666;
      margin: 0;
      margin-left: 20px;
      line-height: 30px;
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'order-popup-close';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      line-height: 1;
    `;
    closeButton.addEventListener('click', () => {
      document.body.removeChild(popupContainer);
    });

    // 添加标题和关闭按钮到头部
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `display: flex; align-items: center;`;
    titleContainer.appendChild(popupTitle);
    titleContainer.appendChild(orderTime);
    popupHeader.appendChild(titleContainer);
    popupHeader.appendChild(closeButton);

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      display: flex;
      flex-direction: ${isMobile ? 'column' : 'row'};
      gap: 20px;
    `;

    // 创建订单信息区域（左侧）
    const orderInfoSection = document.createElement('div');
    orderInfoSection.style.cssText = `
      flex: ${isMobile ? '1' : '4'};
      order: ${isMobile ? '2' : '1'};
      ${!isMobile ? 'padding-right: 30px; border-right: 1px solid #cccccc;' : ''}
    `;

    // 创建订单详情区域（右侧）
    const orderDetailsSection = document.createElement('div');
    orderDetailsSection.style.cssText = `
      flex: ${isMobile ? '1' : '8'};
      order: ${isMobile ? '1' : '2'};
      ${!isMobile ? 'padding-left: 30px;' : ''}
    `;

    // 渲染订单详情
    this.renderOrderTable(orderDetailsSection, orderData, vueInstance, isMobile);
    this.renderOrderInfo(orderInfoSection, orderData, vueInstance, isMobile);

    // 组装内容
    contentContainer.appendChild(orderInfoSection);
    contentContainer.appendChild(orderDetailsSection);

    // 组装弹窗
    popupContent.appendChild(popupHeader);
    popupContent.appendChild(contentContainer);
    popupContainer.appendChild(popupContent);

    // 添加弹窗到body
    document.body.appendChild(popupContainer);

    // 添加点击遮罩关闭弹窗
    popupContainer.addEventListener('click', (e) => {
      if (e.target === popupContainer) {
        document.body.removeChild(popupContainer);
      }
    });

    // 添加ESC键关闭弹窗
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        if (document.body.contains(popupContainer)) {
          document.body.removeChild(popupContainer);
        }
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  // 渲染订单表格（商品列表）
  renderOrderTable(container, orderData, vueInstance, isMobile) {
    const t = (key, params = {}) => {
      return vueInstance.$t ? vueInstance.$t(key, params) : key;
    };

    // 移动端显示商品列表
    if (isMobile) {
      const productsContainer = document.createElement('div');
      productsContainer.className = 'order-products';
      productsContainer.style.cssText = `
        margin-bottom: 30px;
      `;

      // 获取商品列表 - 优先使用line_items字段
      const lineItems = this.getOrderLineItems(orderData);

      if (lineItems.length === 0) {
        // 如果没有商品项，显示提示信息
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = `
          padding: 15px;
          text-align: center;
          color: #999;
          font-family: var(--text-font-family);
        `;
        emptyMessage.textContent = t('account.no_products');
        productsContainer.appendChild(emptyMessage);
      } else {
        lineItems.forEach(item => {
          const productItem = document.createElement('div');
          productItem.className = 'order-product';
          productItem.style.cssText = `
            background: #F7F7F9;
            padding: 12px 14px;
            margin-bottom: 1px;
            display: flex;
            flex-direction: column;
            font-style: normal;
          `;

          // 创建商品各项信息
          const createItemRow = (label, value, isPrice = false) => {
            const row = document.createElement('div');
            row.style.cssText = `
              margin: 10px 0px;
              display: flex;
              flex-direction: row;
              justify-content: space-between;
            `;

            const labelSpan = document.createElement('span');
            labelSpan.innerHTML = `<i style="font-size: 14px; font-family: var(--text-font-family); font-weight: 400; color: #000000; font-style: normal;">${label}</i>`;

            const valueSpan = document.createElement('span');
            if (isPrice) {
              valueSpan.innerHTML = `<span style="color: #595959; font-size: 14px; font-family: var(--text-font-family); font-weight: 400; font-style: normal;">${this.formatCurrency(value)}</span>`;
            } else {
              valueSpan.innerHTML = `<span style="color: #595959; font-size: 14px; font-family: var(--text-font-family); font-weight: 400; font-style: normal;">${value}</span>`;
            }

            row.appendChild(labelSpan);
            row.appendChild(valueSpan);
            return row;
          };

          // 获取商品标题和变体
          const itemName = this.getProductName(item);
          const itemVariant = this.getProductVariant(item);

          // 添加商品名 - 显示产品名和变体信息
          const productNameEl = createItemRow(t('account.product'), itemName);
          if (itemVariant) {
            // 添加变体信息到商品名称下方
            const variantInfo = document.createElement('div');
            variantInfo.style.cssText = `
              margin-top: 5px;
              padding-left: 10px;
              color: #595959;
              font-size: 12px;
              font-family: var(--text-font-family);
            `;
            variantInfo.textContent = itemVariant;

            // 获取第二个span（即商品名值的span）
            const productValueSpan = productNameEl.querySelector('span:nth-child(2)');
            if (productValueSpan) {
              productValueSpan.appendChild(variantInfo);
            }
          }
          productItem.appendChild(productNameEl);

          // 获取商品价格和数量
          const itemPrice = this.getProductPrice(item);
          const itemQuantity = this.getProductQuantity(item);

          // 添加价格
          productItem.appendChild(createItemRow(t('account.price'), itemPrice, true));
          // 添加数量
          productItem.appendChild(createItemRow(t('account.quantity'), itemQuantity));
          // 添加小计
          const totalPrice = itemPrice * itemQuantity;
          productItem.appendChild(createItemRow(t('account.total'), totalPrice, true));

          productsContainer.appendChild(productItem);
        });
      }

      container.appendChild(productsContainer);
    } else {
      // PC端显示商品表格
      const table = document.createElement('table');
      table.className = 'order-table';
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      `;

      // 创建表头
      const thead = document.createElement('thead');
      thead.style.cssText = `
        background-color: #f7f6fb;
      `;

      const headerRow = document.createElement('tr');

      // 表头单元格样式
      const thStyle = `
        text-align: left;
        height: 11px;
        font-size: 14px;
        font-family: var(--text-font-family);
        font-weight: 500;
        line-height: 42px;
        color: #222A40;
        padding: 8px 12px;
      `;

      // 添加表头列
      const headers = [
        { text: t('account.product'), width: '35%' },
        { text: t('account.price'), width: '20%' },
        { text: t('account.quantity'), width: '20%' },
        { text: t('account.total'), width: '25%' }
      ];

      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header.text;
        th.style.cssText = `${thStyle} width: ${header.width};`;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // 创建表体
      const tbody = document.createElement('tbody');

      // 获取商品列表
      const lineItems = this.getOrderLineItems(orderData);

      if (lineItems.length === 0) {
        // 如果没有商品项，显示提示信息
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 4;
        emptyCell.style.cssText = `
          text-align: center;
          padding: 20px;
          color: #999;
          font-family: var(--text-font-family);
        `;
        emptyCell.textContent = t('account.no_products');
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
      } else {
        lineItems.forEach(item => {
          const row = document.createElement('tr');
          row.style.cssText = `
            border-bottom: 1px solid #c3c3c3;
          `;

          // 单元格样式
          const tdStyle = `
            text-align: left;
            vertical-align: middle;
            height: 14px;
            font-size: 14px;
            font-family: var(--text-font-family);
            font-weight: 400;
            color: #222A40;
            line-height: 42px;
            padding: 8px 12px;
          `;

          // 商品名称和变体
          const nameCell = document.createElement('td');
          nameCell.style.cssText = tdStyle;

          // 获取商品完整信息
          const itemName = this.getProductName(item);
          const itemVariant = this.getProductVariant(item);

          nameCell.innerHTML = `
            <a style="color: #222A40; text-decoration: none;" href="#">${itemName}</a>
            ${itemVariant ? `<div style="font-size: 13px; color: #666;">${itemVariant}</div>` : ''}
          `;
          row.appendChild(nameCell);

          // 获取商品价格和数量
          const itemPrice = this.getProductPrice(item);
          const itemQuantity = this.getProductQuantity(item);

          // 价格
          const priceCell = document.createElement('td');
          priceCell.style.cssText = tdStyle;
          priceCell.textContent = this.formatCurrency(itemPrice);
          row.appendChild(priceCell);

          // 数量
          const quantityCell = document.createElement('td');
          quantityCell.style.cssText = `${tdStyle} text-align: center;`;
          quantityCell.innerHTML = `<i style="font-style: normal">${itemQuantity}</i>`;
          row.appendChild(quantityCell);

          // 总计
          const totalCell = document.createElement('td');
          totalCell.style.cssText = tdStyle;
          const totalPrice = itemPrice * itemQuantity;
          totalCell.textContent = this.formatCurrency(totalPrice);
          row.appendChild(totalCell);

          tbody.appendChild(row);
        });
      }

      table.appendChild(tbody);
      container.appendChild(table);
    }
  },

  // 获取订单中的商品列表
  getOrderLineItems(orderData) {
    return orderData.line_items || [];
  },

  // 获取商品名称
  getProductName(item) {
    return item.order_item_name || '-';
  },

  // 获取商品价格
  getProductPrice(item) {
    return parseFloat(item.price || 0);
  },

  // 获取商品数量
  getProductQuantity(item) {
    return parseInt(item.qty || 0, 10);
  },

  // 获取商品属性
  getProductVariant(item) {
    const attrs = item.attrs || {};
    if (Object.keys(attrs).length === 0) return '';

    return Object.entries(attrs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  },

  // 渲染订单信息（合计、地址等）
  renderOrderInfo(container, orderData, vueInstance, isMobile) {
    const t = (key, params = {}) => {
      return vueInstance.$t ? vueInstance.$t(key, params) : key;
    };

    // 订单合计部分
    const orderTotal = document.createElement('div');
    orderTotal.className = 'order-total';
    orderTotal.style.cssText = `
      background: #F7F7F9;
      padding: 15px 20px;
      margin-bottom: 30px;
      display: flex;
      flex-direction: column;
      font-style: normal;
    `;

    // 创建价格行样式
    const createPriceRow = (label, value, isTotal = false) => {
      const row = document.createElement('div');
      row.style.cssText = `
        margin: 10px 0px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      `;

      const labelSpan = document.createElement('span');
      if (isTotal) {
        labelSpan.innerHTML = `<i style="font-family: var(--text-font-family); color: #222A40; font-size: 20px; font-weight: bold; font-style: normal;">${label}</i>`;
      } else {
        labelSpan.innerHTML = `<i style="font-size: 16px; font-family: var(--text-font-family); font-weight: 400; color: #222A40; font-style: normal;">${label}</i>`;
      }

      const valueSpan = document.createElement('span');
      if (isTotal) {
        valueSpan.innerHTML = `<span style="font-family: var(--text-font-family); color: #222A40; font-size: 16px; font-weight: bold;">${this.formatCurrency(value)}</span>`;
      } else {
        valueSpan.innerHTML = `<span style="font-family: var(--text-font-family); color: #222A40; font-size: 16px;">${this.formatCurrency(value)}</span>`;
      }

      row.appendChild(labelSpan);
      row.appendChild(valueSpan);
      return row;
    };

    // 添加小计
    const subtotal = orderData.product_contents_total || 0;
    orderTotal.appendChild(createPriceRow(t('account.subtotal'), subtotal));

    // 添加折扣行
    if (orderData.discount_total > 0) {
      // 创建折扣行容器
      const discountContainer = document.createElement('div');
      discountContainer.style.cssText = `
        margin: 10px 0 5px 0;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
      `;

      // 创建折扣标签和价格行
      const discountLabelRow = document.createElement('div');
      discountLabelRow.style.cssText = `
        width: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: space-between;
      `;

      const discountLabel = document.createElement('span');
      discountLabel.innerHTML = `<i style="font-size: 16px; font-family: var(--text-font-family); font-weight: 400; color: #222A40; font-style: normal;">${t('account.discount')}</i>`;

      const discountValue = document.createElement('div');
      discountValue.innerHTML = `<span style="font-family: var(--text-font-family); color: #222A40; font-size: 16px;">- ${this.formatCurrency(orderData.discount_total)}</span>`;

      discountLabelRow.appendChild(discountLabel);
      discountLabelRow.appendChild(discountValue);
      discountContainer.appendChild(discountLabelRow);

      // 添加优惠码信息
      if (orderData.coupon_code) {
        const couponRow = document.createElement('p');
        couponRow.style.cssText = `
          width: 100%;
          margin: 0;
          white-space: nowrap;
          font-size: 14px;
          color: #999;
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          text-align: left;
          line-height: 1.5;
        `;

        couponRow.innerHTML = `
          <i class="iconfont" style="white-space: nowrap; display: flex; align-items: center; margin-right: 10px;">
            <span style="margin-right: 5px;">&#xe718;</span>
            <i style="font-size: 14px; font-family: var(--text-font-family); font-weight: 400; color: #999; font-style: normal;">
              ${orderData.coupon_code}
            </i>
          </i>
        `;

        discountContainer.appendChild(couponRow);
      }

      orderTotal.appendChild(discountContainer);
    }

    // 添加运费行
    if (orderData.order_shipping > 0) {
      const shippingRow = document.createElement('div');
      shippingRow.style.cssText = `
        margin: 10px 0px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      `;

      const shippingLabel = document.createElement('span');
      shippingLabel.innerHTML = `<i style="font-size: 16px; font-family: var(--text-font-family); font-weight: 400; color: #222A40; font-style: normal;">${t('account.shipping')} (<i class="secondary_title" style="font-style: normal;">${orderData.payment_channel_to_store || 'Standard Shipping'}</i>)</i>`;

      const shippingValue = document.createElement('span');
      shippingValue.innerHTML = `<span style="font-family: var(--text-font-family); color: #222A40; font-size: 16px;">${this.formatCurrency(orderData.order_shipping)}</span>`;

      shippingRow.appendChild(shippingLabel);
      shippingRow.appendChild(shippingValue);
      orderTotal.appendChild(shippingRow);
    }

    // 添加税费
    const tax = parseFloat(orderData.order_tax || 0) + parseFloat(orderData.order_shipping_tax || 0);
    if (tax > 0) {
      orderTotal.appendChild(createPriceRow(t('checkout.tax'), tax));
    }

    // 添加总计行
    orderTotal.appendChild(createPriceRow(t('account.total'), orderData.order_total, true));

    container.appendChild(orderTotal);

    // 创建地址部分
    const addressContainer = document.createElement('div');
    addressContainer.className = 'order-address';
    addressContainer.style.cssText = `
      background: #F7F7F9;
      padding: 15px 20px;
      text-align: left;
    `;

    // 渲染账单地址
    this.renderAddressSection(
      addressContainer,
      t('account.billing_address'),
      `<strong>${t('account.payment_status')}:</strong> <span style="font-size: 16px; font-family: var(--text-font-family); font-weight: 400; color: #222A40;">${t(`account.${orderData.financial_status === 'waiting' ? 'unpaid' : orderData.financial_status}`)}</span>`,
      this.formatAddress(orderData.billing_address)
    );

    // 渲染配送地址
    this.renderAddressSection(
      addressContainer,
      t('account.shipping_address'),
      `<strong>${t('account.fulfillment_status')}:</strong> <span style="font-size: 16px; font-family: var(--text-font-family); font-weight: 400; color: #222A40;">${t(`account.${orderData.fulfillment_status}`)}</span>`,
      this.formatAddress(orderData.shipping_address)
    );

    container.appendChild(addressContainer);
  },

  // 格式化地址
  formatAddress(address) {
    if (!address) return '';
    return `
      ${address.first_name || ''} ${address.last_name || ''}<br />
      ${address.address_1 || ''} ${address.address_2 || ''}<br />
      ${address.city || ''} ${address.state || ''} ${address.postcode || ''}<br />
      ${address.country || ''}
    `;
  },

  // 渲染地址部分
  renderAddressSection(container, title, statusHTML, addressHTML) {
    const section = document.createElement('div');
    section.style.cssText = `
      margin: 15px 0px;
    `;

    const titleElement = document.createElement('h4');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      font-size: 20px;
      font-weight: 500;
      line-height: 42px;
      color: #222A40;
      margin: 0;
    `;

    const statusElement = document.createElement('p');
    statusElement.style.cssText = `
      font-size: 16px;
      font-weight: 500;
      line-height: 42px;
      margin: 0;
    `;
    statusElement.innerHTML = statusHTML;

    const addressElement = document.createElement('p');
    addressElement.style.cssText = `
      font-size: 16px;
      font-weight: 400;
      line-height: 24px;
      color: #222A40;
    `;
    addressElement.innerHTML = addressHTML;

    section.appendChild(titleElement);
    section.appendChild(statusElement);
    section.appendChild(addressElement);

    container.appendChild(section);
  },

  // 格式化货币
  formatCurrency(value) {
    if (value === undefined || value === null) return '-';

    // 获取Vue实例以获取货币设置
    const vueInstance = StateManager.getVueInstance();
    let currencySymbol = '$';

    if (vueInstance && vueInstance.$store && vueInstance.$store.state.pricetype) {
      const currency = vueInstance.$store.state.pricetype;
      if (currency.symbol) {
        currencySymbol = currency.symbol;
      }
    }

    try {
      return `${currencySymbol}${Number(value).toFixed(2)}`;
    } catch (e) {
      return `${currencySymbol}0.00`;
    }
  },

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  },
}

// 链接处理服务
const LinkManager = {
  // 处理旧订单链接 - 修改链接行为
  processOldOrderLinks() {
    console.log('处理旧订单链接...')
    const orderLinks = document.querySelectorAll('.ordertable tbody tr td a')
    orderLinks.forEach((link) => {
      // 标记已经处理过的链接
      if (link.getAttribute('data-processed-old') === 'true') return

      // 保存原始href
      const originalHref = link.getAttribute('href')
      if (!link.getAttribute('data-original-href')) {
        link.setAttribute('data-original-href', originalHref)
      }

      // 修改为javascript操作
      link.setAttribute('href', 'javascript:void(0);')
      link.setAttribute('data-processed-old', 'true')

      // 设置样式，让用户知道这是可点击的
      link.style.cursor = 'pointer'
      link.style.textDecoration = 'underline'
      link.style.color = '#0066cc'

      // 为链接添加点击事件处理
      link.addEventListener('click', function (e) {
        // 再次检查当前是否处于old-order模式，防止模式已切换但事件仍被触发
        if (StateManager.getCurrentTab() !== 'old-order') {
          return true // 允许默认行为
        }

        e.preventDefault()

        // 获取订单ID
        const orderId = this.textContent.replace(/[^0-9]/g, '').trim()
        if (!orderId) return

        // 从表格数据中获取订单信息
        const orderData = OrderData.getOrderDataFromTable(orderId)
        if (orderData) {
          // 使用Vue风格弹窗显示订单信息
          OrderUI.showOrderPopup(orderData)
        } else {
          // 如果表格数据中没有，通过API获取
          OrderData.fetchAndShowOrder(orderId)
        }
      })
    })
  },

  // 恢复订单链接到原始状态
  restoreOrderLinks() {
    console.log('恢复订单链接...')
    const orderLinks = document.querySelectorAll('.ordertable tbody tr td a')

    if (orderLinks.length === 0) {
      console.log('未找到订单链接元素')
    } else {
      console.log(`找到 ${orderLinks.length} 个订单链接元素`)
    }

    orderLinks.forEach((link) => {
      // 只处理已修改过的链接
      if (link.getAttribute('data-processed-old') === 'true') {
        // 恢复原始href
        const originalHref = link.getAttribute('data-original-href')
        if (originalHref) {
          link.setAttribute('href', originalHref)
          console.log(`恢复链接: ${originalHref}`)
        }

        // 移除标记
        link.removeAttribute('data-processed-old')

        // 恢复样式
        link.style.cursor = ''
        link.style.textDecoration = ''
        link.style.color = ''
      }
    })
  },
}

// 事件处理
const EventHandler = {
  // 处理标签切换事件
  setupTabEvents(container) {
    // 为订单表格添加点击代理
    const orderTable = document.querySelector('.ordertable')
    if (orderTable) {
      // 移除旧的事件监听器，避免重复绑定
      const newHandler = function (e) {
        // 只在Old Order模式下拦截
        if (StateManager.getCurrentTab() !== 'old-order') return

        // 查找是否点击的是订单链接
        let target = e.target
        while (target && target !== this) {
          if (target.tagName === 'A' && target.textContent.includes('#')) {
            // 阻止默认行为
            e.preventDefault()
            e.stopPropagation()

            // 获取订单ID
            const orderId = target.textContent.replace(/[^0-9]/g, '').trim()
            if (!orderId) return

            // 从表格数据中查找订单
            const orderData = OrderData.getOrderDataFromTable(orderId)
            if (orderData) {
              // 使用Vue风格弹窗显示订单数据
              OrderUI.showOrderPopup(orderData)
            } else {
              // 如果表格数据中没有，通过API获取
              OrderData.fetchAndShowOrder(orderId)
            }

            return false
          }
          target = target.parentNode
        }
      }

      // 保存处理函数引用，以便能移除它
      if (orderTable._orderClickHandler) {
        orderTable.removeEventListener('click', orderTable._orderClickHandler)
      }
      orderTable._orderClickHandler = newHandler
      orderTable.addEventListener('click', newHandler)
    }

    // 获取 Tab 按钮
    const tabs = container.querySelectorAll('.order-tab')
    tabs.forEach((tab) => {
      tab.addEventListener('click', function () {
        // 如果已经是激活状态，不做任何操作
        if (this.classList.contains('active')) return

        // 更新活跃状态
        tabs.forEach((t) => {
          if (t === this) {
            t.style.backgroundColor = '#333'
            t.style.color = '#fff'
            t.style.border = '1px solid #333'
            t.classList.add('active')
          } else {
            t.style.backgroundColor = '#fff'
            t.style.color = '#333'
            t.style.border = '1px solid #ddd'
            t.classList.remove('active')
          }
        })

        // 切换内容
        const tabType = this.getAttribute('data-tab')
        const oldType = StateManager.getCurrentTab()

        if (oldType !== tabType) {
          // 先更新状态
          StateManager.setCurrentTab(tabType)

          // 如果是切换到Old Order，才需要获取Vue实例
          if (tabType === 'old-order') {
            // 延迟处理，确保DOM已更新
            setTimeout(() => {
              // 找到Vue实例并重置分页
              if (!StateManager.getVueInstance()) {
                VueManager.findVueInstance()
              }

              // 重置分页到第1页
              VueManager.resetPagination()

              // 处理订单链接
              LinkManager.processOldOrderLinks()
            }, 100)
          } else {
            // 如果是从old-order切换回new-order
            if (oldType === 'old-order') {
              console.log('从old-order切换回new-order，恢复链接默认行为')

              // 立即恢复链接，不等待分页重置
              LinkManager.restoreOrderLinks()

              // 然后重置分页
              if (StateManager.getVueInstance()) {
                VueManager.resetPagination()
              }
            } else {
              // 其他情况下正常重置分页
              if (StateManager.getVueInstance()) {
                VueManager.resetPagination()
              }
            }
          }
        }
      })
    })
  },
}
export { OrderData, OrderUI, LinkManager, EventHandler }

