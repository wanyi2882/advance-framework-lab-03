const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const generateToken = (user, secretKey, expiry) => {
    return jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, secretKey, {
        'expiresIn': expiry
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const { User, BlackListedToken } = require('../../models')
const { checkIfAuthenticatedJWT } = require('../../middlewares');

router.post('/login', async function(req,res){
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        'require': false
    })

    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        let accessToken = generateToken(user, process.env.TOKEN_SECRET, '1h');
        let refreshToken = generateToken(user, process.env.REFRESH_TOKEN_SECRET, '3W')
        res.json({
            accessToken,
            refreshToken
        });
    } else{
        res.json({
            'error':"Wrong email or password"
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, function(req,res){
    res.json({
        'user': req.user
    })
})

router.post('/refresh', async function(req,res){
    let refreshToken = req.body.refreshToken
    if(!refreshToken){
        res.sendStatus(401)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err,user)=>{
        if(err){
            res.sendStatus(403)
        } else {

            // check if the token has been blacklisted
            let blackListedToken = await BlackListedToken.where({
                'token': refreshToken
            }).fetch({
                'require': false
            })

            if (blackListedToken) {
                res.status(401);
                res.send({
                    'error':'This token has been expired'
                })
            } else {
                let accessToken = generateToken(user, process.env.TOKEN_SECRET, '1h');
                res.json({
                    accessToken
                })
            }

            let accessToken = generateToken(user, process.env.TOKEN_SECRET, '1h')
            res.json({
                accessToken
            })
        }
    })
})

router.post('/logout', async function(req,res){
    let refreshToken = req.body.refreshToken
    if(!refreshToken){
        res.status(401)
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err,user)=>{
            if(err){
                res.sendStatus(403)
            } else {
                const token = new BlackListedToken()
                token.set('token', refreshToken)
                token.set('date_created', new Date())
                await token.save()
                res.json({
                    'message':"Logged out"
                })
            }
        })
    }
})

module.exports = router