import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
    const authToken = req.header('Authorization').replace('Bearer ', '')
    //console.log(authToken);

    if (!authToken) {
        res.status(401).json({ msg: 'No authToken found' })
    }

    try {
        const data = jwt.verify(authToken, process.env.JWT_SECRET)
        req.user = data
        next()
    } catch (error) {
        res.send(error)
    }
}