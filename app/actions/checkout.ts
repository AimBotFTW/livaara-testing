"use server";

export type CheckoutFormData = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
};

export type CheckoutSuccessResult = {
  ok: boolean;
  orderId?: string;
  orderNumber?: number;
  error?: string;
};
