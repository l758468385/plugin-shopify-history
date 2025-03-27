<template>
  <div v-if="order" class="orderpage container row">
    <div class="col-md-4 col-12 order_msg">
      <div class="order_products d-block d-md-none">
        <div
          class="order_product"
          v-for="item in items"
          :key="item.orderitem_id"
        >
          <!-- 商品名 -->
          <div class="order_product__name">
            <span class="order_product__name__title">
              <i class="page_text_font">{{ $t("account.product") }}</i>
            </span>
            <span class="page_text_font">
              <a
                class="page_text_font_msg"
                :href="`/search?q=${item.order_item_title}`"
                >{{ item.order_item_title }}</a
              >
            </span>
          </div>
          <!-- sku -->
          <div class="order_product__sku">
            <span class="text-uppercase">
              <i class="page_text_font">{{ $t("account.sku") }}</i>
            </span>
            <span class="page_text_font">
              <i class="page_text_font_msg">{{ item.sku }}</i>
            </span>
          </div>
          <!-- 价格 -->
          <div class="order_product__price">
            <span>
              <i class="page_text_font">{{ $t("account.price") }}</i>
            </span>
            <span class="page_text_font page_text_font_msg">
              <v-selectprice
                :price="item.price"
                :font-size="14"
                :disable_select="true"
                :country="$store.state.pricetype"
                :show_country="false"
              ></v-selectprice>
            </span>
          </div>
          <!-- 数量 -->
          <div class="order_product__quantity">
            <span>
              <i class="page_text_font">{{ $t("account.quantity") }}</i>
            </span>
            <span class="page_text_font">
              <i class="page_text_font_msg">{{ item.quantity }}</i>
            </span>
          </div>
          <!-- 总价 -->
          <div class="order_product__total">
            <span>
              <i class="page_text_font">{{ $t("account.total") }}</i>
            </span>
            <span class="page_text_font page_text_font_msg">
              <v-selectprice
                :price="Number(item.price) * Number(item.quantity)"
                :font-size="14"
                :disable_select="true"
                :country="$store.state.pricetype"
                :show_country="false"
              ></v-selectprice>
            </span>
          </div>
        </div>
      </div>

      <div class="order_total">
        <!-- 折扣前商品总价 -->
        <div class="order_total__subtotal">
          <span>
            <i class="page_text_font">{{ $t("account.subtotal") }}</i>
          </span>
          <span>
            <v-selectprice
              :price="order_subtotal"
              :font-size="20"
              :disable_select="true"
              :country="$store.state.pricetype"
              :show_country="false"
            ></v-selectprice>
          </span>
        </div>
        <!-- 折扣 -->
        <div class="order_total__discount">
          <span>
            <i class="page_text_font">{{ $t("account.discount") }}</i>
          </span>
          <div>
            <span class="order_total__discount__price">
              -
              <span>
                <v-selectprice
                  :price="discount_cart"
                  :font-size="16"
                  :disable_select="true"
                  :country="$store.state.pricetype"
                  :show_country="false"
                ></v-selectprice>
              </span>
            </span>
          </div>
        </div>
        <!-- 运费 -->
        <div class="order_total__fixed" v-if="cost">
          <span>
            <i class="page_text_font">{{ $t("account.shipping") }}</i>
          </span>
          <span>
            <v-selectprice
              :price="cost"
              :font-size="20"
              :disable_select="true"
              :country="$store.state.pricetype"
              :show_country="false"
            ></v-selectprice>
          </span>
        </div>
        <!-- 订单总价 -->
        <div class="order_total__ordertotal">
          <span>
            <i class="secondary_title">{{ $t("account.total") }}</i>
          </span>
          <span>
            <v-selectprice
              :price="order_total"
              :font-size="20"
              :disable_select="true"
              :country="$store.state.pricetype"
              :show_country="false"
            ></v-selectprice>
          </span>
        </div>
      </div>
      <div class="order_address">
        <div v-if="order.orderBilling" class="billing_address_msg">
          <h4 class="title">{{ $t("account.billing_address") }}</h4>
          <p class="status">
            <strong>{{ $t("account.payment_status") }}:</strong>
            <span class="page_text_font">{{
              $t(`account.${financial_status}`)
            }}</span>
          </p>
          <p class="page_text_font">
            {{ order.orderBilling.first_name }}
            {{ order.orderBilling.last_name }}
            <br />
            {{ order.orderBilling.address1 }} {{ order.orderBilling.address2 }}
            {{ order.orderBilling.city }}
            <br />
            {{ order.orderBilling.zip }}
            <span>{{ order.orderBilling.province }}</span>
            <br />
            {{ order.orderBilling.country }}
          </p>
        </div>
        <div v-if="order.orderShipping" class="shipping_address_msg">
          <h4 class="title">{{ $t("account.shipping_address") }}</h4>
          <p class="status">
            <strong>{{ $t("account.fulfillment_status") }}:</strong>
            <span class="page_text_font">{{
              fulfillment_status == "unfulfilled"
                ? $t("account.unfulfilled")
                : fulfillment_status == "fulfilled"
                ? $t("account.fulfilled")
                : order.fulfillment_status
            }}</span>
          </p>
          <p class="page_text_font">
            {{ order.orderShipping.first_name }}
            {{ order.orderShipping.last_name }}
            <br />

            {{ order.orderShipping.address1 }}
            {{ order.orderShipping.address2 }} {{ order.orderShipping.city }}
            <br />
            {{ order.orderShipping.zip }}
            <span>{{ order.orderShipping.province }}</span>
            <br />
            {{ order.orderShipping.country }}
          </p>
        </div>
      </div>
    </div>
    <div class="col-md-8 col-12 order_details">
      <div class="title">
        <h4 class="order_id">{{ $t("account.order") }} #{{ order_id }}</h4>
        <p class="time">{{ created_at }}</p>
      </div>
      <table class="table order_table d-none d-md-block">
        <thead>
          <tr>
            <th :style="{ width: isMobile ? '22%' : 'auto' }">
              {{ $t("account.product") }}
            </th>
            <th class="text-uppercase">{{ $t("account.sku") }}</th>
            <th :style="{ width: isMobile ? '18%' : 'auto' }">
              {{ $t("account.price") }}
            </th>
            <th :style="{ width: isMobile ? '22%' : 'auto' }">
              {{ $t("account.quantity") }}
            </th>
            <th :style="{ width: isMobile ? '18%' : 'auto' }">
              {{ $t("account.total") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- 商品 -->
          <tr class="product" v-for="item in items" :key="item.orderitem_id">
            <td>
              <a
                class="page_text_font"
                :href="`/search?q=${item.order_item_title}`"
                >{{ item.order_item_title }}</a
              >
            </td>
            <td class="page_text_font">
              <i>{{ item.sku }}</i>
            </td>
            <td class="price secondary_title">
              <v-selectprice
                :price="item.price"
                :font-size="14"
                :disable_select="true"
                :country="$store.state.pricetype"
                :show_country="false"
              ></v-selectprice>
            </td>
            <td class="secondary_title" style="text-align: center">
              <i>{{ item.quantity }}</i>
            </td>
            <td class="total secondary_title">
              <v-selectprice
                :price="Number(item.price) * Number(item.quantity)"
                :font-size="14"
                :disable_select="true"
                :country="$store.state.pricetype"
                :show_country="false"
              ></v-selectprice>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  props: ["show_currency_selector", "currency_style"],
  data() {
    return {
      order: null,
      discount_cart: 0, //优惠券价格
      items: [],
      order_subtotal: 0, //所有商品折扣前总价
      order_total: 0, //所有商品折扣后总价
      Shipping_Insurance: 0, //运费险价格
      order_id: "", //订单id
      created_at: "", //订单创建时间
      cost: 0, //运费
      fulfillment_status: "", //物流状态
      financial_status: "", //付款状态
    };
  },
  methods: {
    isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      return flag;
    },
    getProductVariant(obj) {
      return Object.values(obj).join("/");
    },
  },
  async beforeMount() {
    let orderNum = window.location.pathname.split("/")?.[3];
    try {
      let res = await shopSDK.io.http.get(`${API.ordersOld}/${orderNum}`);
      this.order = res?.responseBody || {};
      // 商品数据
      this.items = this.order.orderInfo;
      // 订单id
      this.order_id = this.order?.orderInfo?.[0]?.order_id
        ? this.order.orderInfo[0].order_id
        : "";
      // 订单创建时间
      this.created_at = this.order?.orderInfo?.[0]?.created_at
        ? this.order.orderInfo[0].created_at
        : "";
      // 物流状态
      this.fulfillment_status = this.order?.orderInfo?.[0]?.created_at
        ? this.order.orderInfo[0].fulfillment_status
        : "unfulfilled";
      // 付款状态
      this.financial_status = this.order?.orderInfo?.[0]?.created_at
        ? this.order.orderInfo[0].financial_status
        : "unpaid";
      // 总优惠
      this.discount_cart = this.order?.orderInfo?.[0]?.total_discounts
        ? this.order.orderInfo[0].total_discounts - 0
        : 0;
      // 运费
      this.cost = this.order?.orderInfo?.[0]?.shipping_price
        ? this.order.orderInfo[0].shipping_price - 0
        : 0;
      // 折扣后总价
      this.order_total = this.order?.orderInfo?.[0]?.total_price
        ? this.order.orderInfo[0].total_price - 0
        : 0;
      // 折扣前总价
      this.order_subtotal = this.order_total + this.discount_cart - this.cost;
    } catch (error) {
      /** @type {import('@mshop/api').HttpResponseError} */
      const err = error;
      if (err?.responseResult?.responseBody?.message) {
        this.$message.error(err?.responseResult?.responseBody.message);
      }
    }
  },
};
</script>
<style scoped lang="scss">
#app .orderpage {
  padding: 0;
  padding-top: 50px;
  .order_msg {
    padding: 0;
    padding-right: 50px;
    border-right: 1px solid #cccccc;
    .order_products {
      margin-bottom: 30px;
      .order_product {
        background: #f7f7f9;
        padding: 12px 14px;
        margin-bottom: 1px;
        display: flex;
        flex-direction: column;
        font-style: normal;
        &__name,
        &__sku,
        &__price,
        &__quantity,
        &__total {
          margin: 10px 0px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          &__title {
            white-space: nowrap;
          }
          .page_text_font_msg {
            color: #595959;
            font-size: 14px;
            font-family: Roboto;
            font-weight: 400;
            font-style: normal;
          }
          .page_text_font {
            font-size: 14px;
            font-family: Roboto;
            font-weight: 400;
            color: #000000;
            font-style: normal;
          }
          .selectpricewrap {
            &::v-deep .secondary_title {
              color: #595959 !important;
              font-family: Roboto !important;
              font-weight: 400 !important;
              font-style: normal !important;
            }
          }
        }
        &__name {
          span.page_text_font {
            text-align: right;
          }
        }
      }
    }
    .order_total {
      background: #f7f7f9;
      padding: 15px 30px;
      margin-bottom: 30px;
      display: flex;
      flex-direction: column;
      font-style: normal;
      &__subtotal,
      &__discount,
      &__fixed,
      &__ordertotal {
        margin: 10px 0px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .page_text_font {
          font-size: 20px;
          font-family: Roboto;
          font-weight: 400;
          color: #222a40;
          font-style: normal;
        }
        .selectpricewrap {
          &::v-deep .secondary_title {
            color: #222a40 !important;
            font-family: Roboto !important;
            font-weight: 400 !important;
            font-style: normal !important;
          }
        }
        &__label {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
      }
      &__discount {
        div {
          display: flex;
          flex-direction: column;
          span {
            margin: 3px 0px;
            .page_text_font {
              font-size: 16px;
              font-family: Roboto;
              font-weight: 400;
              color: #8694a1;
              font-style: normal;
            }
          }
        }
        &__price {
          display: flex;
          align-items: center;
          .selectpricewrap {
            &::v-deep .secondary_title {
              color: #8694a1 !important;
              font-family: Roboto !important;
              font-weight: 400 !important;
              font-style: normal !important;
            }
          }
        }
      }
      &__ordertotal {
        .secondary_title {
          font-family: Roboto;
          color: #222a40;
          font-size: 20px;
          font-weight: bold;
          font-style: normal;
        }
        .selectpricewrap {
          &::v-deep .secondary_title {
            color: #222a40 !important;
            font-family: Roboto !important;
            font-weight: bold !important;
            font-style: normal !important;
          }
        }
      }
    }
    .order_address {
      background: #f7f7f9;
      padding: 15px 30px;
      text-align: left;
      .billing_address_msg,
      .shipping_address_msg {
        margin: 15px 0px;
        .title,
        .status.page_text_font {
          font-family: Roboto;
          color: #222a40;
        }
        .title {
          font-size: 20px;
          font-weight: 500;
          line-height: 42px;
        }
        .status {
          font-size: 16px;
          font-weight: 500;
          line-height: 42px;
        }
        .page_text_font {
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
        }
      }
    }
  }
  .order_details {
    padding-left: 50px;
    .title {
      display: flex;
      margin-bottom: 45px;
      .order_id {
        font-size: 20px;
        font-family: Roboto;
        font-weight: 400;
        color: #222a40;
      }
      .time {
        font-size: 14px;
        font-family: Roboto;
        font-weight: 300;
        color: #666666;
        line-height: 30px;
        margin-left: 20px;
      }
    }
    .order_table {
      thead {
        background-color: #f7f6fb;
        tr {
          th {
            text-align: left;
            height: 11px;
            font-size: 14px;
            font-family: Roboto;
            font-weight: 500;
            line-height: 42px;
            color: #222a40;
          }
        }
      }
      tbody {
        & > tr {
          border-bottom: 1px solid #c3c3c3;
          td {
            word-wrap: normal;
            text-align: left;
            vertical-align: middle;
            height: 14px;
            font-size: 14px;
            font-family: Roboto;
            font-weight: 400;
            color: #222a40;
            line-height: 42px;
            i {
              font-style: normal;
              a {
                text-decoration: underline;
              }
            }
            .selectpricewrap {
              &::v-deep .secondary_title {
                color: #222a40 !important;
                font-family: Roboto !important;
                font-weight: 400 !important;
                font-style: normal !important;
              }
            }
          }
        }
      }
    }
  }
}
@media screen and (max-width: 768px) {
  .container {
    padding: 0 !important;
  }
  .orderpage {
    padding-top: 20px !important;
    margin: 0;
    .order_msg {
      order: 2;
      padding-left: 15px !important;
      padding-right: 15px !important;
      border: none !important;
      .order_total,
      .order_address {
        padding: 12px 14px !important;
        .page_text_font {
          font-size: 15px !important;
        }
      }
    }
    .order_details {
      padding: 0 !important;
      order: 1;
      .title {
        margin: 0 15px 25px !important;
      }
      .order_table {
        width: 100%;
        display: table;
        overflow: auto;
        thead {
          tr {
            word-wrap: normal;
            th {
              //width: 20%;
              padding: 17px 8px !important;
              height: 10px !important;
              font-size: 13px !important;
              line-height: 21px !important;
            }
            th:first-child {
              padding-left: 15px !important;
              padding-right: 8px !important;
            }
            th:last-child {
              padding-left: 8px !important;
              padding-right: 15px !important;
            }
          }
        }
        tbody {
          tr {
            td {
              //width: 20%;
              padding: 17px 8px !important;
              height: 24px !important;
              font-size: 13px !important;
              line-height: 15px !important;
              &::v-deep {
                .selectpricewrap {
                  .product_price_price {
                    .money {
                      display: flex;
                    }
                  }
                }
              }
            }
            td:first-child {
              padding-left: 15px !important;
              padding-right: 8px !important;
            }
            td:last-child {
              padding-left: 8px !important;
              padding-right: 15px !important;
            }
          }
          & > tr:last-child {
            border-bottom: 1px solid #c3c3c3 !important;
          }
        }
      }
    }
  }
}
</style>
