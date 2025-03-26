import { mapState } from "vuex";
import { getTaxes } from "@/js/lib/checkout";
import mixCart from "@/js/mixins/mixCart";
const accountOrder = {
  data() {
    return {
      items: [], // 商品订单
      order_subtotal: 0, //所有商品折扣前总价
      Shipping_Insurance: 0, //运费险价格
      tip: 0, //小费价格
      cartItems: [], // properties：{groupId} 特殊属性存在时重组购物车商品
    };
  },
  mixins: [mixCart],
  computed: {
    ...mapState({
      isMobile: ({ isMobile }) => isMobile,
      showCurrencySelector: ({ options }) =>
        options?.theme?.global?.show_currency_selector,
      currencySelectorType: ({ options }) =>
        options?.theme?.global?.currency_selector_type,
      priceSymbol: ({ priceSymbol }) => priceSymbol,
    }),
    mix_free_shipping() {
      // 优惠券中是否有免运费
      return this.mix_computed_coupon.some((item) => item?.free_shipping);
    },
    mix_computed_coupon() {
      // 所有自动优惠都不显示
      const { discount_record = [] } = this.order;
      // 不属于自动优惠券的才显示
      return discount_record.map((item) => {
        return {
          ...item,
          front_show_code:
            item?.auto_coupon === false || item?.auto_coupon === 0,
        };
      });
    },
    mix_order_shipping() {
      // 所有自动优惠都不显示
      const { order_shipping } = this.order;
      return this.mix_free_shipping
        ? this.$t("shopping.free")
        : order_shipping - 0;
    },
    mix_discount_cart() {
      //优惠价格
      return this.order?.discount_total || 0;
    },
    // 税费金额
    taxesTotal() {
      const {
        order_tax: productTaxesTotal,
        order_shipping_tax: shippingTaxesTotal,
      } = this.order;
      return getTaxes({
        productTaxesTotal,
        shippingTaxesTotal,
      });
    },
  },
  beforeMount() {
    console.log(this.order, "order");
    this.myService = this.service;
  },
  mounted() {
    const { line_items = [], fees = [] } = this.order;
    this.items = line_items.filter((item) => {
      return item.order_item_type === "line_item";
    });
    let isHaveSpecial = Object.values(this.items).some(
      (item) => item?.properties?.groupId
    );
    if (isHaveSpecial) {
      this.regroup(this.items);
      this.items = this.cartItems;
    }
    if (fees?.length) {
      fees.forEach((item) => {
        const { order_item_name, line_total } = item;
        console.log(
          order_item_name,
          line_total,
          "order_item_name , line_total"
        );
        switch (order_item_name) {
          case "Shipping Insurance":
            this.Shipping_Insurance = line_total - 0;
            break;
          case "Tip":
            this.tip = line_total - 0;
            break;

          default:
            break;
        }
      });
    }
    this.order_subtotal = this.items.reduce(
      (acr, cur) => acr + (cur.line_subtotal - 0),
      0
    );
  },
};

export default accountOrder;
