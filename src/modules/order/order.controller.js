import couponModel from "../../../db/models/coupon.model.js";
import productModel from './../../../db/models/product.model.js';
import orderModel from "../../../db/models/order.model.js";
import cartModel from './../../../db/models/cart.model.js';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { createInvoice } from "../../utils/pdf.js";
import { sendEmail } from './../../service/sendEmail.js';





// ===================================  createOrder ================================================
export const createOrder = asyncHandler(async (req, res, next) => {
    const { productId, quantity, couponCode, paymentMethod, address, phone } = req.body

    if (couponCode) {
        const coupon = await couponModel.findOne({
            code: couponCode.toLowerCase(),
            usedBy: { $nin: [req.user._id] },
        })
        if (!coupon || coupon.toDate < Date.now()) {
            return next(new AppError("Invalid coupon code or coupon already used or expired", 404))
        }
        req.body.coupon = coupon
    }

    let products = []
    let flag = false
    if (productId) {
        products = [{ productId, quantity }] //js
    } else {
        const cart = await cartModel.findOne({ user: req.user._id })
        if (!cart.products.length) {
            return next(new AppError("cart is empty please select a product to order", 404))
        }
        products = cart.products //BSON
        flag = true
    }

    let finalProducts = []
    let subPrice = 0
    for (let product of products) {
        const checkProduct = await productModel.findOne({ _id: product.productId, stock: { $gte: product.quantity } })
        if (!checkProduct) {
            return next(new AppError("product not found or out of stock", 404))
        }
        if (flag) {
            product = product.toObject()
        }
        product.title = checkProduct.title
        product.price = checkProduct.subPrice
        product.finalPrice = checkProduct.subPrice * product.quantity
        subPrice += product.finalPrice  //subPrice=subPrice+product.finalPrice
        finalProducts.push(product)
    }

    const order = await orderModel.create({
        user: req.user._id,
        products: finalProducts,
        subPrice,
        couponId: req.body.coupon?._id,
        totalPrice: subPrice - subPrice * ((req.body.coupon?.amount || 0) / 100),
        paymentMethod,
        status: paymentMethod == "cash" ? "placed" : "waitPayment",
        phone,
        address
    })

    if (req.body?.coupon) {
        await couponModel.updateOne({ _id: req.body.coupon._id }, {
            $push: { usedBy: req.user._id }
        })
    }

    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, {
            $inc: { stock: -product.quantity }
        })
    }

    if (flag) {
        await cartModel.updateOne({ user: req.user._id }, { products: [] })
    }


    const invoice = {
        shipping: {
            name: req.user.name,
            address: req.user.address,
            city: "Egypt",
            state: "CA",
            country: "US",
            postal_code: 94111
        },
        items: order.products,
        subtotal: subPrice,
        paid: order.totalPrice,
        invoice_nr: order._id,
        date: order.createdAt,
        coupon: req.body?.coupon?.amount || 0
    };

    await createInvoice(invoice, "invoice.pdf");

    await sendEmail(req.user.email, "Order Details", `<p>Order Details</p>`, [
        {
            path: "invoice.pdf",
            contentType: "application/pdf"
        }, {
            path: "route.jpeg",
            contentType: "image/jpeg"
        }
    ])

    return res.status(201).json({ msg: "done", order })
})




// ===================================  cancelOrder ================================================
export const cancelOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    const { reason } = req.body
    const order = await orderModel.findOne({ _id: id, user: req.user._id })
    if (!order) {
        return next(new AppError("order not found", 404))
    }
    if ((order.paymentMethod === "cash" && order.status != "placed") || (order.paymentMethod === "card" && order.status != "waitPayment")) {
        return next(new AppError("you can not cancel this order", 400))
    }

    await orderModel.updateOne({ _id: id }, {
        status: "cancelled",
        cancelledBy: req.user._id,
        reason
    })

    if (order?.couponId) {
        await couponModel.updateOne({ _id: order?.couponId }, {
            $pull: { usedBy: req.user._id }
        })
    }

    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, {
            $inc: { stock: product.quantity }
        })
    }

    res.status(200).json({ msg: "done" })


})

