export const verifyToken = async (req, res, next) => {
    // Verificar sesión activa con GitHub
    if (req.session?.passport?.user) {
        console.log("Autenticado con GitHub:", req.session.passport.user);
        return next(); // Permitir la solicitud
    }

    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.cookies && req.cookies[`${config.APP_NAME}_cookie`] ? req.cookies[`${config.APP_NAME}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    console.log("Token recibido en verifyToken:", receivedToken);

    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, async (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });

        try {
            // Asociar datos adicionales como cartId al req.user
            const userCart = await service.getCartByUserId(payload.id); // Obtener el carrito del usuario (si existe)
            
            req.user = { ...payload, cartId: userCart?.id || null }; // Agregar cartId al token decodificado
            console.log("Token verificado con datos adicionales:", req.user);
            next();
        } catch (error) {
            console.error("Error al obtener datos adicionales en verifyToken:", error);
            return res.status(500).send({ error: 'Error interno al procesar el token', data: [] });
        }
    });
};
