import { FC, PropsWithChildren, useEffect, useReducer } from 'react';
import Cookie from 'js-cookie'

import { ICartProduct } from '../../interfaces';
import { CartContext, cartReducer } from './';

export interface CartState {
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
}

export const CART_INITIAL_STATE: CartState = {
    cart: Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
}

export const CartProvider: FC<PropsWithChildren> = ({ children }) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE)

    // Efecto
    useEffect(() => {
        try {
            const cookieProducts = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : []
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: cookieProducts });
        } catch (error) {
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: [] });
        }
    }, []);

    useEffect(() => {
        Cookie.set('cart', JSON.stringify(state.cart));
    }, [state.cart]);

    useEffect(() => {

        const numberOfItems = state.cart.reduce((prev, current) => prev + current.quantity, 0)
        const subTotal = state.cart.reduce((prev, current) => prev + (current.quantity * current.price), 0)
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0)

        const orderSummary = {
            numberOfItems,
            subTotal,
            tax: subTotal * taxRate,
            total: subTotal * (1 + taxRate)
        }

        dispatch({ type: '[Cart] - Update order summary', payload: orderSummary })
    }, [state.cart]);

    const addProductToCart = (product: ICartProduct) => {
        const productInCart = state.cart.some(p => p._id === product._id);
        if (!productInCart) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] })

        const productInCartButDifferentSize = state.cart.some(p => p._id === product._id && p.size === product.size);
        if (!productInCartButDifferentSize) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product] })

        // Acumular
        const updatedProducts = state.cart.map(p => {
            if (p._id !== product._id) return p;
            if (p.size !== product.size) return p;

            // Actualizar la cantidad
            p.quantity += product.quantity;
            return p;
        });

        dispatch({ type: '[Cart] - Update products in cart', payload: updatedProducts });
    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Change cart quantity', payload: product })
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({ type: '[Cart] - Remove product in cart', payload: product })
    }

    return (
        <CartContext.Provider value={{
            ...state,

            //Methods
            addProductToCart,
            removeCartProduct,
            updateCartQuantity,
        }} >
            {children}
        </CartContext.Provider>
    )
};