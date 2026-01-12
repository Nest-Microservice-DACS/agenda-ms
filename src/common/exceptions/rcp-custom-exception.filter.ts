import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RcpCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rcpError = exception.getError();

    // Handle custom error structures
    if (
      typeof rcpError === 'object' &&
      'status' in rcpError &&
      'message' in rcpError
    ) {
      const status = isNaN(Number(rcpError['status']))  // If status is not a number, default to 400
        ? 400
        : Number(rcpError['status']);
      return response.status(status).json(rcpError);
    }

    // Default to 400 Bad Request for other cases
    response.status(400).json({
      status: 400,
      message: rcpError,
    });
  }
}
