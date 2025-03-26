<template>
  <div class="account">
    <div class="container">
      <div class="row">
        <div class="col-md-4 col-12 address">
          <v-addressitem
            :service="service"
            :addressitem="defaultaddress"
            :email="customer.email"
            :uid="customer.ID"
          ></v-addressitem>
          <button style="margin: 30px 0; text-align: start" type="button">
            <a class="text-uppercase" href="/account/address"
              >{{ $t("account.view_addresses") }}({{
                customer.addressBookCount
              }})&gt;</a
            >
          </button>
        </div>
        <div class="col-md-8 col-12 order">
          <h2 class="orderstitle">{{ $t("account.order_history") }}</h2>
          <!-- 需要在此嵌入 new order 和 old order 的切换-->
          <ws-extension-point-simple data-point-key="order-history-tabs">
          </ws-extension-point-simple>
          <table class="ordertable" v-if="orders">
            <thead>
              <tr>
                <th>{{ $t("account.order") }}</th>
                <th>{{ $t("account.date") }}</th>
                <th :style="{ width: isMobile ? '24%' : 'auto' }">
                  {{ $t("account.fulfillment_status") }}
                </th>
                <th :style="{ width: isMobile ? '20%' : 'auto' }">
                  {{ $t("account.payment_status") }}
                </th>
                <th :style="{ width: isMobile ? '20%' : 'auto' }">
                  {{ $t("account.total") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in orders.data" :key="item.id">
                <td>
                  <i>
                    <a
                      style="
                        font-size: 13px;
                        font-weight: 400;
                        color: #111;
                        white-space: nowrap;
                      "
                      :href="'/account/order/' + item.ID"
                      >#{{ item.ID }}</a
                    >
                  </i>
                </td>
                <td style="">
                  <i>{{ formatDate(item.post_date) }}</i>
                </td>
                <td>
                  <i v-if="item.fulfillment_status == 'fulfilled'">{{
                    $t("account.fulfilled")
                  }}</i>
                  <i v-else-if="item.fulfillment_status == 'unfulfilled'">{{
                    $t("account.unfulfilled")
                  }}</i>
                </td>
                <td>
                  <i>
                    {{
                      $t(
                        `account.${
                          item.financial_status === "waiting"
                            ? "unpaid"
                            : item.financial_status
                        }`
                      )
                    }}</i
                  >
                </td>
                <td>
                  <v-selectprice
                    :price="item.order_total"
                    :font-size="14"
                    :disable_select="true"
                    :country="$store.state.pricetype"
                    :show_country="false"
                  ></v-selectprice>
                  <!-- <i>$ {{item.order_total}}</i> -->
                </td>
              </tr>
              <tr style="border-bottom: none !important">
                <td colspan="5">
                  <el-pagination
                    :small="!!isMobile"
                    layout="prev, pager, next"
                    :total="orders.total"
                    @current-change="changePage"
                    :current-page.sync="currentPage"
                    background
                    :pager-count="5"
                  ></el-pagination>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="page_text_font" v-else>
            {{ $t("account.not_placed_any_orders") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vAddressitem from "./addressitem";
import mixAccountHome from "@/js/mixins/mixAccountHome.js";
import { mapState } from "vuex";

export default {
  props: ["defaultaddress", "service"],
  data() {
    return {
      orders: {},
      currentPage: 1,
    };
  },
  mixins: [mixAccountHome],
  computed: {
    ...mapState({
      customer: ({ customer }) => customer || {},
    }),
    isMobile() {
      return navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
    },
  },
  methods: {
    formatDate(time) {
      return new Date(time)
        .toDateString()
        .split(" ")
        .filter((item, index) => index !== 0)
        .join(" ");
    },
  },
  components: {
    vAddressitem,
  },
};
</script>

<style scoped lang="scss">
#app .account {
  margin-top: 30px;
  margin-bottom: 42px;
  .container {
    .tiny {
      max-width: 740px;
      text-align: center;
    }
    .section_title {
      margin: 0 auto 18px;
      border-bottom: 1px solid #cccccc;
      display: flex;
      align-items: center;
      padding: 20px 0;
      justify-content: space-between;
      .title {
        height: 32px;
        font-size: 42px;
        font-weight: bold;
        color: #222a40;
        line-height: 42px;
      }
      button {
        height: 16px;
        font-size: 16px;
        font-weight: 500;
        text-decoration: underline;
        color: #222940;
        line-height: 42px;
      }
    }
    .row {
      margin-top: 50px;
      .address {
        padding-right: 50px;
        border-right: 1px solid #cccccc;
        button {
          a {
            height: 17px;
            font-size: 16px;
            font-family: var(--subtitle-font-family);
            font-weight: bold;
            text-decoration: underline;
            color: #222a40;
            line-height: 42px;
          }
        }
      }
      .order {
        padding-left: 50px;
        .orderstitle {
          height: 19px;
          font-size: 20px;
          font-family: var(--text-font-family);
          font-weight: 400;
          color: #222a40;
          margin-bottom: 30px;
        }
        .page_text_font {
          margin: 20px 0 0 0;
          height: 14px;
          font-size: 14px;
          font-family: var(--text-font-family) !important;
          font-weight: 400;
          color: #999999;
          line-height: 21px;
        }
        .ordertable {
          width: 100%;
          margin: 20px 0 0 0;
          overflow: auto;
          thead {
            background-color: #f7f6fb;
            tr {
              th {
                height: 11px;
                font-size: 14px;
                font-family: var(--text-font-family);
                font-weight: 500;
                color: #222a40;
                line-height: 42px;
                padding: 20px;
              }
              & > th:last-child {
                text-align: left;
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
                font-family: var(--text-font-family);
                font-weight: 400;
                color: #222a40;
                line-height: 42px;

                padding: 20px 20px;
                i {
                  font-style: normal;
                  a {
                    text-decoration: underline;
                  }
                }
                .selectpricewrap {
                  &::v-deep .secondary_title {
                    color: #222a40 !important;
                    font-family: var(--text-font-family) !important;
                    font-weight: 400 !important;
                    font-style: normal !important;
                  }
                }
              }
              & > td:last-child {
                border-bottom: none;
                word-break: keep-all;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
            & > tr:last-child {
              border-bottom: none;
              td {
                text-align: center;
              }
            }
          }
        }
      }
    }
    h2 {
      font-size: 20px;
    }
  }
}
@media screen and (max-width: 768px) {
  .section_title {
    padding: 12px 0 !important;
    justify-content: space-evenly !important;
    flex-direction: column !important;
    align-items: inherit !important;
    .title {
      height: 14px !important;
      font-size: 18px !important;
      line-height: 21px !important;
      text-align: center;
      margin-bottom: 25px !important;
    }
    button {
      outline: none !important;
      height: 13px !important;
      font-size: 13px !important;
      line-height: 21px !important;
    }
  }
  .address,
  .order {
    padding-left: 15px !important;
    padding-right: 15px !important;
    border: none !important;
  }
  .address {
    button {
      a {
        height: 14px !important;
        font-size: 14px !important;
        line-height: 21px !important;
      }
    }
  }
  .order {
    margin-top: 30px !important;
    padding: 0 !important;
    .page_text_font {
      padding: 0 15px !important;
    }
    .ordertable {
      width: 100%;
      display: table;
      overflow: auto;
      thead {
        tr {
          word-wrap: normal;
          th {
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
          td {
            text-align: center;
          }
        }
      }
    }
    h2 {
      padding: 0 15px !important;
      height: 15px !important;
      font-size: 15px !important;
      line-height: 21px !important;
    }
  }
  .row {
    margin-top: 25px !important;
  }
}
</style>
