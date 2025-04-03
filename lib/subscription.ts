import { auth } from "@clerk/nextjs";

export const checkSubscription = async () => {
  // This is a mock implementation that always returns false
  // In a real application, this would check the user's subscription status
  return false;
};
