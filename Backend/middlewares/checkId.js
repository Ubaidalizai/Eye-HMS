import { isValidObjectId } from 'mongoose';
import AppError from '../utils/appError';

function checkId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    res.status();
    throw new AppError(`Invalid Object of: ${req.params.id}`, 404);
  }
  next();
}

export default checkId;
