import { axiosInstance } from '../axios';

export const getAllUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/get-all-users');
    return response.data;
  } catch (error: any) {
    console.log('Error fetching to get all users', error);
    const message =
      error?.response?.data?.message ||
      error.message ||
      'Get all users failed. Please try again.';
    throw new Error(message);
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/auth/get-user-by-id/${userId}`);
    return response.data;
  } catch (error: any) {
    console.log('Error fetching to get user by id', error);
    const message =
      error?.response?.data?.message ||
      error.message ||
      'Get user by id failed. Please try again.';
    throw new Error(message);
  }
};
