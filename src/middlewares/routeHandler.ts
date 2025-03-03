import { error } from "console";
import { Request, Response, NextFunction} from "express";

export const routeHandler =(req:Request,res:Response,next:NextFunction)=>{
    const error=new Error(`Route not found: ${req.method} ${req.originalUrl}`) as any;
    error.status=404;
    next(error);
    
};