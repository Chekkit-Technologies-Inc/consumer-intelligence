import passport from "passport";
import { UserModel } from "./../api/User";
import { AppError } from "./../utils/app-error";

/**
 * middleware for checking authorization with jwt
 */
export const authorize = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async (error, token) => {
        if (error || !token) {
            return next(new AppError("Unauthorized", null, 401));
        }
        try {
            const user = await UserModel.findOne({ where: { username: token.username } });
            if (!user) {
                return next(new AppError("Unauthorized", null, 401));
            }
            req.user = user;
        } catch (error) {
            return next(error);
        }
        next();
    })(req, res, next);
};

export const appAuthorize = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async (error, token) => {
        if (error || !token) {
            return next(new AppError("Unauthorized", null, 401));
        }
        try {
            const user = await UserModel.findOne({ where: { phone_number: token.phone_number } });
            if (!user) {
                return next(new AppError("Unauthorized", null, 401));
            }
            req.user = user;
        } catch (error) {
            return next(error);
        }
        next();
    })(req, res, next);
};
export const authorizeAdmin = (req, res, next) => {
    if (!req.user.admin) {
        return next(new AppError("You are not authorized to access this route", null, 403));
    } else {
        next();
    }
};
