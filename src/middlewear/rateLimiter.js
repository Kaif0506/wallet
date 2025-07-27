import ratelimiter from "../config/uptash.js";

const ratelimiterMiddleware = async (req, res, next) =>{
    try {
        const ip = req.ip;
        const result = await ratelimiter.limit(ip);
        if (!result.success) {
            return res.status(429).json({error: "Too many requests, please try again later."});
        }
        next();
        
    } catch (error) {
        console.error("Rate limiter error:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export default ratelimiterMiddleware;
