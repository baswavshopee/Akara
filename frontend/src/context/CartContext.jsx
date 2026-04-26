import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i._id === action.product._id);
      if (existing) {
        return state.map((i) =>
          i._id === action.product._id
            ? { ...i, qty: i.qty + (action.qty || 1) }
            : i
        );
      }
      return [...state, { ...action.product, qty: action.qty || 1 }];
    }
    case "REMOVE":
      return state.filter((i) => i._id !== action.id);
    case "UPDATE_QTY":
      return state
        .map((i) =>
          i._id === action.id ? { ...i, qty: i.qty + action.delta } : i
        )
        .filter((i) => i.qty > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    [],
    () => JSON.parse(localStorage.getItem("cart") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => dispatch({ type: "ADD", product, qty });
  const removeFromCart = (id) => dispatch({ type: "REMOVE", id });
  const updateQty = (id, delta) => dispatch({ type: "UPDATE_QTY", id, delta });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
