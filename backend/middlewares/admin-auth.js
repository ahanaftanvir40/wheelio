
export const AdminAuth = (req, res, next) => {

    try {
        let isAdmin = req.user.isAdmin

        if (!isAdmin) {
           return res.json({ msg: 'you are not authorized to visit this section' })
        }
        next()


    } catch (error) {
        console.log(error);
    }
}