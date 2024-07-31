import couponModel from "../../../db/models/coupon.model.js";
import productModel from './../../../db/models/product.model.js';
import orderModel from "../../../db/models/order.model.js";
import cartModel from './../../../db/models/cart.model.js';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";
import { createInvoice } from "../../utils/pdf.js";
import { sendEmail } from './../../service/sendEmail.js';
import { payment } from "../../utils/payment.js";
import Stripe from "stripe";





// ===================================  createOrder ================================================
export const createOrder = asyncHandler(async (req, res, next) => {
    const { productId, quantity, couponCode, paymentMethod, address, phone } = req.body

    if (couponCode) {
        const coupon = await couponModel.findOne({
            code: couponCode.toLowerCase(),
            // usedBy: { $nin: [req.user._id] },
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


    // const invoice = {
    //     shipping: {
    //         name: req.user.name,
    //         address: req.user.address,
    //         city: "Egypt",
    //         state: "CA",
    //         country: "US",
    //         postal_code: 94111
    //     },
    //     items: order.products,
    //     subtotal: subPrice,
    //     paid: order.totalPrice,
    //     invoice_nr: order._id,
    //     date: order.createdAt,
    //     coupon: req.body?.coupon?.amount || 0
    // };

    // await createInvoice(invoice, "invoice.pdf");

    // await sendEmail(req.user.email, "Order Details", `<p>Order Details</p>`, [
    //     {
    //         path: "invoice.pdf",
    //         contentType: "application/pdf"
    //     }, {
    //         path: "route.jpeg",
    //         contentType: "image/jpeg"
    //     }
    // ])


    if (paymentMethod === "card") {
        const stripe = new Stripe(process.env.stripe_secret)

        if (req.body?.coupon) {
            const coupon = await stripe.coupons.create({
                percent_off: req.body?.coupon.amount,
                duration: "once",
            })
            console.log(coupon);
            req.body.couponId = coupon.id

        }
        const session = await payment({
            stripe,
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: req.user.email,
            success_url: `${req.protocol}://${req.headers.host}/orders/success/${order._id}`,
            cancel_url: `${req.protocol}://${req.headers.host}/orders/cancel/${order._id}`,
            metadata: { orderId: order._id.toString() },
            line_items: order.products.map((product) => {
                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.title,
                        },
                        unit_amount: product.price * 100
                    },
                    quantity: product.quantity
                }
            }),
            discounts: req.body?.coupon ? [{ coupon: req.body?.couponId }] : []

        })
        return res.status(201).json({ msg: "done", url: session.url, order })

    }


    return res.status(201).json({ msg: "done", order })
})





// ===================================  webhook ================================================
export const webhook = asyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripe = new Stripe(process.env.stripe_secret)
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }


    if (event.type != "checkout.session.completed") {
        await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, {
            status: "rejected"
        })
        return res.status(400).json({ msg: "fail" })
    }

    await orderModel.updateOne({ _id: event.data.object.metadata.orderId }, {
        status: "placed"
    })
    return res.status(400).json({ msg: "done" })
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

