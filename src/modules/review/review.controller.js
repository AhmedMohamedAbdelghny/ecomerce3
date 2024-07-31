import reviewModel from "../../../db/models/review.model.js";
import productModel from './../../../db/models/product.model.js';
import orderModel from './../../../db/models/order.model.js ';
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/classError.js";



// ===================================  createReview ================================================
export const createReview = asyncHandler(async (req, res, next) => {
    const { comment, rate } = req.body
    const { productId } = req.params

    const productExist = await productModel.findById(productId)
    if (!productExist) {
        return next(new AppError("product not found", 404))
    }

    const review = await reviewModel.findOne({
        createdBy: req.user._id,
        productId
    })
    if (review) {
        return next(new AppError("review already exist", 404))
    }

    const order = await orderModel.findOne({
        user: req.user._id,
        "products.productId": productId,
        status: "delivered"
    })

    if (!order) {
        return next(new AppError("you must have a delivered order to review this product", 404))
    }
    const newReview = await reviewModel.create({
        comment,
        rate,
        createdBy: req.user._id,
        productId
    })

    // const reviews = await reviewModel.find({ productId })
    // let sum = 0
    // for (const review of reviews) {
    //     sum += review.rate
    // }
    // productExist.rateAvg = sum / reviews.length
    // await productExist.save()

    let sum = productExist.rateAvg * productExist.rateNum
    sum = sum + rate

    productExist.rateAvg = sum / (productExist.rateNum + 1)
    productExist.rateNum += 1
    await productExist.save()
    return res.status(201).json({ msg: "done", review: newReview })

})



// 
// ===================================  deleteReview ================================================
export const deleteReview = asyncHandler(async (req, res, next) => {

    const { id } = req.params;

    const review = await reviewModel.findOneAndDelete({
        createdBy: req.user._id,
        _id: id
    })
    if (!review) {
        return next(new AppError("review not exist", 404))
    }

    const product = await productModel.findById(review.productId)

    let sum = product.rateAvg * product.rateNum
    sum = sum - review.rate

    product.rateAvg = sum / (product.rateNum - 1)
    product.rateNum -= 1
    await product.save()
    return res.status(200).json({ msg: "done", review })
})

