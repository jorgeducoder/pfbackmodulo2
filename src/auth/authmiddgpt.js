export const authMiddleware = (req, res, next) => {
    // Sesión de GitHub
    if (req.session?.passport?.user) {
        req.authUser = {
            method: 'GitHub',
            user: req.session.passport.user,
        };
    }

    // Token JWT
    const token = req.headers.authorization?.split(' ')[1] || req.cookies['token'] || req.query.access_token;
    if (token) {
        jwt.verify(token, config.SECRET, (err, payload) => {
            if (!err) {
                req.authUser = {
                    method: 'JWT',
                    user: payload,
                };
            }
        });
    }

    if (!req.authUser) {
        return res.status(401).send({ error: 'No autenticado' });
    }

    next();
};
