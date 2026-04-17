import axiosInstance from "@/lib/axiosInstance";

export interface IInitiatePaymentPayload {
  postId: string;
  amount: number;
  success_url?: string;
  fail_url?: string;
  cancel_url?: string;
}

export interface IInitiatePaymentResponse {
  paymentUrl: string;
}

export const initiatePayment = async (
  payload: IInitiatePaymentPayload
): Promise<{ success: boolean; data: IInitiatePaymentResponse; message?: string }> => {
  const { data } = await axiosInstance.post("/payments/initiate", payload);
  return data;
};
