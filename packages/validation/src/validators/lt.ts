import ValidationError from "~/validationError";

export default (value: any, params?: string[]) => {
    if (!value || !params) {
        return;
    }
    value = value + "";

    if (parseFloat(value) < parseFloat(params[0])) {
        return;
    }

    throw new ValidationError("Value needs to be less than " + params[0] + ".");
};
