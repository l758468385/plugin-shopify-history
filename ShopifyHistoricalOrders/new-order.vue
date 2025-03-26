<template>
  <div class="orderpage" :class="theme_type">
    <div v-if="theme_type == 'default'" class="returnaccountbtn text-md-left text-center">
      <a href="/account" class="secondary_title">← {{ $t('account.return_to_account') }}</a>
    </div>
    <div class="row">
      <div class="col-lg-9 order_left">
        <h4 class="secondary_title">{{ $t('account.order') }} #{{ order.ID }}</h4>
        <p class="secondary_title">{{ order.post_date }}</p>
        <table class="table order_table">
          <thead>
            <tr style="word-break: normal; white-space: nowrap">
              <th class="secondary_title">{{ $t('account.product') }}</th>
              <th class="secondary_title">{{ $t('account.specification') }}</th>
              <th class="secondary_title">{{ $t('account.price') }}</th>
              <th class="secondary_title">{{ $t('account.quantity') }}</th>
              <th class="secondary_title">{{ $t('account.total') }}</th>
            </tr>
          </thead>
          <tbody>
            <!-- 商品 -->
            <tr class="product" v-for="item in items" :key="item.order_item_id">
              <td>
                <span class="page_text_font">{{ $t('account.product') }}</span>
                <a class="page_text_font" :href="item.path || item.public_url">{{ item.order_item_name }}</a>
                <div class="note page_text_font" v-if="order.trackno">
                  {{ order.track_date }}
                  <div class="page_text_font">Other #{{ order.trackno }}</div>
                </div>
              </td>
              <td class="page_text_font">
                <span>{{ $t('account.specification') }}</span>
                <i>{{ createAttrsString(item.attrs) }}</i>
              </td>
              <td class="price secondary_title">
                <span>{{ $t('account.price') }}</span>
                <!-- <i>${{item.variant?(item.variant.price-0).toFixed(2):(item.product.price-0).toFixed(2)}}</i> -->
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="item.price"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
              <td class="secondary_title">
                <span>{{ $t('account.quantity') }}</span>
                <i>{{ item.qty }}</i>
              </td>
              <td class="total secondary_title">
                <span>{{ $t('account.total') }}</span>
                <!-- <i>${{(item.meta2._line_subtotal-0).toFixed(2)}}</i> -->
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="item.line_subtotal"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 折扣前商品总价 -->
            <tr class="subtotal">
              <td colspan="5">
                <i class="page_text_font">{{ $t('account.subtotal') }}</i>
                <!-- <span>${{(order.order_total-cost).toFixed(2)}}</span> -->
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="order_subtotal"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 折扣 -->
            <tr class="discount" v-if="mix_computed_coupon.length || mix_discount_cart > 0">
              <td colspan="5">
                <div>
                  <div>
                    <i class="page_text_font">{{ $t('account.discount') }}</i>
                    <div class="clearfix">
                      <i v-for="(item, index) in mix_computed_coupon"
                        :key="index + item.discount_type"
                        v-show="item.front_show_code && item.code"
                        style="white-space: nowrap"
                      >
                        <i class="iconfont icon-cm-biaoqian">
                          &nbsp;<span class="page_text_font">{{ item.code }}</span>
                        </i>
                      </i>
                    </div>
                  </div>
                  <div style="line-height: 30px;">
                    <template v-if="mix_free_shipping">{{ $t('shopping.free_shipping') }}</template>
                    <template v-else>
                      -
                      <v-selectprice
                        :fontSize="theme_type == 'showtime' ? '14' : ''"
                        :disable_select="disablePriceSelector"
                        :currency_style="currency_style"
                        :price="mix_discount_cart.toFixed(2)"
                        :appendToBody="false"
                      ></v-selectprice>
                    </template>
                  </div>
                </div>
              </td>
            </tr>
            <!-- 运费 -->
            <tr class="fixed" v-if="order.shippings.length">
              <td colspan="5" class="clearfix">
                <i class="page_text_font"
                  >{{ $t('account.shipping') }} (<i
                    class="secondary_title"
                    v-html="order.shippings[0].order_item_name"
                  ></i
                  >)</i
                >
                <!-- <span>${{(cost).toFixed(2)}}</span> -->
                <span v-if="isNaN(mix_order_shipping)" style="float: right; line-height: 30px">
                  {{ mix_order_shipping }}
                </span>
                <v-selectprice
                  v-else
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="mix_order_shipping"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 运费险 -->
            <tr class="fixed" v-if="Shipping_Insurance">
              <td colspan="5">
                <i class="page_text_font">{{ $t('account.shipping_insurance') }}</i>
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="Shipping_Insurance"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 税费 -->
            <tr class="fixed" v-if="taxesTotal">
              <td colspan="5">
                <i class="page_text_font">{{ $t('checkout.tax') }}</i>
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="taxesTotal"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 小费 -->
            <tr class="fixed" v-if="tip">
              <td colspan="5">
                <i class="page_text_font text-capitalize">{{ $t('checkout.tip') }}</i>
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="disablePriceSelector"
                  :currency_style="currency_style"
                  :price="tip"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
            <!-- 订单总价 -->
            <tr class="ordertotal">
              <td colspan="5">
                <i class="secondary_title">{{ $t('account.total') }}</i>
                <!-- <span>${{(order.order_total-0).toFixed(2)}}</span> -->
                <!-- <span style="margin:0 5px;line-height:28px;">{{this.$store.state.checkoutcurrency}}</span> -->
                <v-selectprice
                  :fontSize="theme_type == 'showtime' ? '14' : ''"
                  :disable_select="!(showPriceSelector && currencySelectorType == 'global')"
                  :currency_style="currency_style"
                  :price="order.order_total - 0"
                  :appendToBody="false"
                ></v-selectprice>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-lg-3 order_right">
        <div class="row">
          <div class="col-12">
            <h4 class="secondary_title">{{ $t('account.billing_address') }}</h4>
            <p>
              <strong class="secondary_title">{{ $t('account.payment_status') }}:</strong>

              <span class="page_text_font">{{$t(`account.${order.financial_status === 'waiting' ? 'unpaid' : order.financial_status}`)}}</span>
            </p>
            <p class="page_text_font">
              {{ order.billing_address.first_name }} {{ order.billing_address.last_name }}
              <br v-if="theme_type == 'venue'" />
              <br />
              {{ order.billing_address.address_1 }} {{ order.billing_address.address_2 }}
              {{ order.billing_address.city }}
              <br v-if="theme_type == 'venue'" />
              <br />
              {{ order.billing_address.postcode }}
              <span
                v-if="getstate(order.billing_address.state, order.billing_address.country, this.myService)"
                v-html="getstate(order.billing_address.state, order.billing_address.country, this.myService)"
              ></span>
              <span v-else>{{ order.billing_address.state }}</span>
              <br v-if="theme_type == 'venue'" />
              <br />
              {{ getcountry(order.billing_address.country, this.myService) }}
            </p>
          </div>
          <!-- <div class="col-12 text-center">
            <v-line></v-line>
          </div>-->
          <div class="col-12">
            <h4 class="secondary_title">{{ $t('account.shipping_address') }}</h4>
            <p>
              <strong class="secondary_title">{{ $t('account.fulfillment_status') }}:</strong>
              <span class="page_text_font">{{
                order.fulfillment_status == 'unfulfilled'
                  ? $t('account.unfulfilled')
                  : order.fulfillment_status == 'fulfilled'
                  ? $t('account.fulfilled')
                  : order.fulfillment_status
              }}</span>
            </p>
            <p class="page_text_font">
              {{ order.shipping_address.first_name }} {{ order.shipping_address.last_name }}
              <br />
              <br v-if="theme_type == 'venue'" />
              {{ order.shipping_address.address_1 }} {{ order.shipping_address.address_2 }}
              {{ order.shipping_address.city }}
              <br />
              <br v-if="theme_type == 'venue'" />
              {{ order.shipping_address.postcode }}
              <span
                v-if="getstate(order.shipping_address.state, order.shipping_address.country, this.myService)"
                v-html="getstate(order.shipping_address.state, order.shipping_address.country, this.myService)"
              ></span>
              <span v-else>{{ order.shipping_address.state }}</span>
              <br />
              <br v-if="theme_type == 'venue'" />
              {{ getcountry(order.shipping_address.country, this.myService) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import mixAccountOrder from '@/js/mixins/mixAccountOrder'
export default {
  props: ['order', 'cost', 'service', 'theme_type', 'currency_style',
    'disableCurrencyTranslation'
  ],
  data() {
    return {
      myService: [],
    }
  },
  computed: {
    ...mapState({
      showCurrencySelector: ({ options }) => options?.theme?.global?.show_currency_selector,
      currencySelectorType: ({ options }) => options?.theme?.global?.currency_selector_type,
    }),
    disablePriceSelector() {
      if (this.disableCurrencyTranslation) {
        return true
      }

      if (this.showCurrencySelector && this.currencySelectorType == 'global') {
        return false
      }

      return true
    }
  },
  mixins: [mixAccountOrder],
}
</script>
<style scoped lang='scss'>
.orderpage {
  text-align: left;
  .returnaccountbtn {
    margin-bottom: 40px;

    a {
      text-decoration: none;
      color: black;
      font-size: 14px;
    }
  }

  .row {
    .order_left {
      margin-bottom: 30px;
      h4 {
        font-size: 20px;
        color: black;
        margin-bottom: 10px;
        font-weight: 600 !important;
      }
      .order_table {
        max-width: 100%;
        width: 100%;
        margin: 0;
        overflow: auto;
        background-color: rgb(246, 246, 246);
        thead {
          tr {
            th {
              border-top: none;
              border-bottom: 1px solid black;
              vertical-align: middle;
              font-size: 16px;
              &:nth-child(4),
              &:nth-child(5) {
                text-align: right;
              }
            }
          }
        }
        tbody {
          td {
            padding: 10px 16px;
            vertical-align: middle;
            border: none;
            span,
            .selectpricewrap {
              float: right;
            }
            i {
              word-break: break-all;
              line-height: 30px;
            }
          }
          .product {
            td {
              span {
                word-break: normal;
                display: none;
              }
              a {
                text-decoration: none;
                color: #212529;
                font-size: 14px;
              }
              .note {
                margin-bottom: 15px;
                padding: 6px 12px;
                border: 1px solid #1c1d1d;
                color: #222323;
                font-size: 12px;
              }
              // &:not(:first-child) {
              //   i {
              //     white-space: nowrap;
              //   }
              // }
              &:nth-child(4),
              &:nth-child(5) {
                i {
                  float: right;
                }
              }
            }
          }
          .discount {
            td > div{
              display: flex;
              flex-direction: row;
              flex-wrap: nowrap;
              align-items: center;
              justify-content: space-between;
            }
            td {
              .iconfont {
                padding-right: 5px;
              }
            }
            span {
              float: unset;
            }
          }
          //subtotal的样式
          .subtotal {
            td {
              border-top: 1px solid black;
            }
          }
          //TOTAL的样式
          tr:last-child {
            td {
              border-top: 1px solid black;
            }
          }
        }
      }
    }

    .order_right {
      h4 {
        font-size: 20px;
        color: black;
        margin-bottom: 10px;
        font-weight: 600 !important;
      }

      p {
        margin-bottom: 15px;
      }
    }
  }
}

.venue {
  .order_table {
    thead {
      tr {
        background: #f5f5f5;
        th {
          border: none !important;
          &:nth-child(4) {
            text-align: left !important;
          }
        }
      }
    }
    tbody {
      td {
        vertical-align: middle;
        border: none;
        // .note {
        //   border: none !important;
        // }
        span,
        .selectpricewrap {
          line-height: 1;
        }
        i {
          word-break: break-all;
        }
      }
      .product {
        border: none !important;
        td {
          .note {
            border: none !important;
          }
          span {
            display: none;
          }
          a {
            text-decoration: none;
            color: #212529;
            font-size: 14px;
          }
          .note {
            margin-bottom: 15px;
            padding: 6px 12px;
            border: 1px solid #1c1d1d;
            color: #222323;
            font-size: 12px;
          }
          // &:not(:first-child) {
          //   i {
          //     white-space: nowrap;
          //   }
          // }
          &:nth-child(4) {
            i {
              float: left !important;
            }
          }
          &:nth-child(3) {
            .selectpricewrap {
              float: left !important ;
            }
          }
        }
      }
      .subtotal {
        td {
          border-top: none !important;
        }
      }
      tr:nth-child(odd) {
        background: #e4e4e4;
      }
      tr:nth-child(even) {
        background: #f5f5f5;
      }
      tr:last-child {
        td {
          border: none !important;
          border-top: none !important;
        }
      }
    }
  }
}

.showtime {
  .row {
    margin-left: -30px;
  }

  .order_left {
    padding: 0 0 0 30px;

    h4 {
      font-size: 1.067em !important;
      color: #2f2f2f !important;
    }

    .order_table {
      margin-bottom: 30px !important;
      border: 1px solid #dedede;
      width: 100%;

      thead {
        tr {
          th {
            border-bottom: 1px solid #858585 !important;
            text-align: left;
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);
          }
        }
      }

      tbody {
        .product {
          &:not(:first-child) {
            border-top: 1px solid #dedede !important;
          }

          td {
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);

            a {
              color: #858585 !important;
            }

            a:hover,
            a:focus {
              color: #b0b3af !important;
            }

            .note {
              font-size: 14px !important;
              font-style: normal;
              line-height: 1.6;
              color: #858585 !important;
              font-family: var(--text-font-family);
              border: 1px solid #858585 !important;
            }
          }
        }

        .subtotal {
          td {
            border-top: 1px solid #858585 !important;
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);
          }
        }

        .discount {
          td {
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);
          }
        }

        .fixed {
          td {
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);
          }
        }

        .ordertotal {
          td {
            border-top: 1px solid #858585 !important;
            padding: 15px;
            font-size: 14px !important;
            font-style: normal;
            line-height: 1.6;
            color: #858585;
            font-family: var(--text-font-family);
          }
        }
      }
    }
  }

  .order_right {
    padding: 0 0 0 30px;

    .row {
      padding: 0 0 0 30px;
    }

    .col-12 {
      position: relative;
      width: 100%;
      flex: 0 0 100%;
      padding: 0;

      h4 {
        font-size: 1.067em;
        color: #2f2f2f;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .orderpage {
    .row {
      .order_left {
        .order_table {
          display: table;
          thead {
            display: none;
          }
          tbody {
            .product {
              td {
                width: 100%;
                border: none;
                display: flex;
                justify-content: space-between;
                span {
                  display: inline-block;
                  padding-right: 26px;
                }

                i,
                a {
                  text-align: right;
                }
              }
            }
          }
        }
      }
    }
  }
  .default {
    .selectpricewrap {
      &::v-deep {
        .pricelistbox {
          right: 50px;
        }
      }
    }
  }
  .showtime {
    .order_table {
      border: none !important;

      tbody {
        .product {
          td {
            span {
              font-weight: 600;
            }
          }
        }

        .ordertotal {
          td {
            i {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
* {
  i {
    font-style: normal;
  }
}
</style>
