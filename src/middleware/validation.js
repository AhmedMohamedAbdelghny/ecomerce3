

const dataMethods = ["body", "query", "params", "headers", "file", "files"]


export const validation = (schema) => {
    return (req, res, next) => {
        let arrayError = []
        dataMethods.forEach((key) => {
            if (schema[key]) {
                const { error } = schema[key].validate(req[key], { abortEarly: false })
                if (error) {
                    error.details.forEach((err) => {
                        arrayError.push(err.message)
                    })
                }
            }

        })
        if (arrayError.length) {
            return res.status(400).json({ msg: "validation error", error: arrayError })
        }
        next()
    }
}

