import cartModel from "../../../db/models/cart.model.js";
import productModel from "../../../db/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";



// ===================================  createCart ================================================
export const createCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity } = req.body

    const product = await productModel.findOne({ _id: productId, stock: { $gte: quantity } })
    if (!product) {
        return next(new AppError("product not found or out of stock", 404))
    }

    const cartExist = await cartModel.findOne({ user: req.user._id })
    if (!cartExist) {
        const cart = await cartModel.create({
            user: req.user._id,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ msg: "done", cart })
    }

    let flag = false
    for (const product of cartExist.products) {
        if (productId == product.productId) {
            product.quantity = quantity
            flag = true
            break;
        }
    }

    if (!flag) {
        cartExist.products.push({ productId, quantity })
    }

    await cartExist.save()
    res.status(201).json({ msg: "done", cart: cartExist })

})



// ===================================  removeCart ================================================
export const removeCart = asyncHandler(async (req, res, next) => {
    const { productId } = req.body

    const cartExist = await cartModel.findOneAndUpdate({
        user: req.user._id,
        "products.productId": productId
    }, {
        $pull: { products: { productId } }
    }, {
        new: true
    }
    )
    if (!cartExist) {
        return next(new AppError("cart not exist", 404))
    }

    res.status(201).json({ msg: "done", cart: cartExist })

})


// ===================================  clearCart ================================================
export const clearCart = asyncHandler(async (req, res, next) => {


    const cartExist = await cartModel.findOneAndUpdate(
        {
            user: req.user._id,
        },
        {
            products: []
        }
        , {
            new: true
        }
    )
    if (!cartExist) {
        return next(new AppError("cart not exist", 404))
    }

    res.status(201).json({ msg: "done", cart: cartExist })

})