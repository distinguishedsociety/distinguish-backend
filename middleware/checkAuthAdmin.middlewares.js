const User = require('../models/user')
const jwt = require('jsonwebtoken')

const checkAuth = async ( req ,res, next) => {
    try {
        // const token = req.header('Authorization').replace('Bearer ', '')
        // const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // TODO - Add Admin aduthentication code here
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = checkAuth