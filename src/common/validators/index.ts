import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateValid', async: false })
export class IsDateValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) {
      return true; // Allow optional empty dates
    }

    if (typeof value !== 'string') {
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(value)) {
      return false;
    }

    const parsedDate = Date.parse(value);

    return !isNaN(parsedDate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid date format. Please provide a valid date in "yyyy-mm-dd" format.';
  }
}
