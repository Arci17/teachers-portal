export class CustomError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = this.constructor.name;
    }
}
export class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized') {
        super(message);
    }
}
export class UnauthenticatedError extends CustomError {
    constructor(message = 'Unauthenticated') {
        super(message);
    }
}
export class RecordNotFoundError extends CustomError {
    constructor(message = 'RecordNotFound') {
        super(message);
    }
}
export class InvalidRequestError extends CustomError {
    constructor(message = 'InvalidRequest') {
        super(message);
    }
}
