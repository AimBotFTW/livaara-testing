import { z } from "zod";

export const CheckoutFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "Please enter your first name")
    .max(50, "Please enter your first name")
    .regex(/^[a-zA-Z\s'-]+$/, "Please enter your first name"),

  lastName: z
    .string()
    .max(50, "Please enter a valid last name")
    .regex(/^[a-zA-Z\s'-]*$/, "Please enter a valid last name")
    .optional(),

  email: z
    .string()
    .min(1, "Please enter a valid email address")
    .email("Please enter a valid email address"),

  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),

  address: z
    .string()
    .min(10, "Please enter your full address (minimum 10 characters)")
    .max(200, "Please enter your full address (minimum 10 characters)"),

  apartment: z.string().optional(),

  pincode: z.string().regex(/^[1-9]\d{5}$/, "Please enter a valid 6-digit pincode"),

  city: z.string().min(2, "Please enter your city").max(50, "Please enter your city"),

  state: z.enum(
    [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi",
      "Jammu and Kashmir",
      "Ladakh",
      "Lakshadweep",
      "Puducherry",
    ],
    { errorMap: () => ({ message: "Please select your state" }) },
  ),
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;
