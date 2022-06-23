import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRICE_PER_ITEM } from "../utils/constants";

interface OptionCountsProps {
  [index: string]: Map<string, number>;
}

type OptionType = "scoops" | "toppings";

type OptionCountsTotalProps = {
  scoops: number;
  toppings: number;
  grandTotal: number;
};

type UpdateItemCount = (
  itemName: string,
  newItemCount: string,
  optionType: OptionType
) => void;

type OrderDetailsContextData = [
  {
    scoops: OptionCountsProps;
    toppings: OptionCountsProps;
    totals: OptionCountsTotalProps;
  },
  UpdateItemCount
];

const OrderDetailsContext = createContext<OrderDetailsContextData | null>(null);

function OrderDetailsProvider(props: any) {
  const [optionCounts, setOptionCounts] = useState<OptionCountsProps>({
    scoops: new Map(),
    toppings: new Map(),
  });

  const [totals, setTotals] = useState<OptionCountsTotalProps>({
    scoops: 0,
    toppings: 0,
    grandTotal: 0,
  });

  function calculateSubTotal(
    optionType: OptionType,
    optionCounts: OptionCountsProps
  ) {
    let optionCount: number = 0;

    for (const count of optionCounts[optionType].values()) {
      optionCount += count;
    }
    return optionCount * PRICE_PER_ITEM[optionType];
  }

  useEffect(() => {
    const scoopsSubTotal: number = calculateSubTotal("scoops", optionCounts);
    const toppingSubTotal: number = calculateSubTotal("toppings", optionCounts);
    const grandTotal: number = scoopsSubTotal + toppingSubTotal;

    setTotals({
      scoops: scoopsSubTotal,
      toppings: toppingSubTotal,
      grandTotal,
    });
  }, [optionCounts]);

  const value = useMemo(() => {
    function updateItemCount(
      itemName: string,
      newItemCount: string,
      optionType: OptionType
    ) {
      const newOptionCounts: OptionCountsProps = { ...optionCounts };
      const optionCountsMap = optionCounts[optionType];
      const newItemCountVerification = isNaN(parseInt(newItemCount))
        ? 0
        : parseInt(newItemCount);
      optionCountsMap.set(itemName, newItemCountVerification);

      setOptionCounts(newOptionCounts);
    }

    return [{ ...optionCounts, totals }, updateItemCount];
  }, [optionCounts, totals]);

  return <OrderDetailsContext.Provider value={value} {...props} />;
}

function useOrderDetailsContext() {
  const context = useContext(OrderDetailsContext);

  if (!context) {
    throw new Error(
      "OrderDetailsContext must be used within a OrderDetailsProvider"
    );
  }
  return context;
}

export { useOrderDetailsContext, OrderDetailsProvider };
