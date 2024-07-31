



export const deleteFromDB = async (req, res, next) => {
    if (req?.data) {
        const { id, model } = req.data
        await model.deleteOne({ _id: id })
    }

}