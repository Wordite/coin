import * as yup from 'yup'

export const contactFormSchema = yup.object({
  name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .nullable()
    .required('Phone is required')
    .transform((value) => value || null)
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  privacyConsent: yup
    .boolean()
    .required('You must agree to the Privacy Policy')
    .oneOf([true], 'You must agree to the Privacy Policy')
})

export type ContactFormData = yup.InferType<typeof contactFormSchema> 