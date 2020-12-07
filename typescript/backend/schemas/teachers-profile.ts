import { ValidationSchema } from 'fastest-validator';
import { pick, transform } from 'lodash';
import { TeachersProfile } from '../common/entities/teachers-profile';
import { buildValidator } from '../utils/validate';

const teachersProfileSchema: ValidationSchema<TeachersProfile> = {
  _id: { type: 'string', min: 3, max: 255, optional: true },
  email: { type: 'email' },
  fullName: { type: 'string', min: 3 },
  slug: { type: 'string', min: 3, optional: true },
  profileImage: { type: 'string', min: 3 },
  phoneNumber: { type: 'string', min: 3, max: 255 },
  countryId: { type: 'string', min: 3, max: 255 },
  city: { type: 'string', min: 3, max: 255 },
  streetAddress: { type: 'string', min: 3 },
  languageId: { type: 'string', min: 3, max: 255 },
  levelId: { type: 'string', min: 3, max: 255 },
  statusId: { type: 'string', min: 3, max: 255 },
  teachersInfoId: { type: 'string', min: 3, max: 255 },
  facebook: {
    type: 'string',
    optional: true,
    min: 3,
    max: 300,
    pattern: /^([\w\-]*\/)*[\w\-.]*$/,
  },
  instagram: {
    type: 'string',
    optional: true,
    min: 3,
    max: 300,
    pattern: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/,
  },
  linkedIn: {
    type: 'string',
    optional: true,
    min: 3,
    max: 300,
    pattern: /([^\/?&\s]*)(?:\/|&|\?)?.*$/,
  },
  about: { type: 'string', optional: true },
};

const teachersProfileUpdateSchema = {
  ...transform(
    pick(teachersProfileSchema, ['profileImage', 'phoneNumber', 'city', 'streetAddress']),
    (acc, validation, field) => {
      acc[field] = { ...validation, optional: true };
    },
    {}
  ),
  country: { type: 'string' },
  language: { type: 'string' },
};

export const validateTeachersProfile = buildValidator<TeachersProfile>(teachersProfileSchema);
export const validateTeachersProfileUpdate = buildValidator<Partial<TeachersProfile>>(
  teachersProfileUpdateSchema
);
