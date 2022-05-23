import { AxiosInstance } from 'axios';
import { CircleRequest, CircleResponse } from './types/circle';
import { buildClient } from './utils/client';

export const CircleKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get all circles of a user
  index: (): Promise<CircleResponse[]> => axiosInstance.get<unknown, CircleResponse[]>('/circles'),

  // Get the details of a certain circle
  show: (circle_id: string): Promise<CircleResponse> => axiosInstance.get<unknown, CircleResponse>(`/circles/${circle_id}`),

  // Create a circle
  create: (name: string): Promise<CircleResponse> => axiosInstance.post<unknown, CircleResponse>('/circles', { name }),

  // Modify the circle name
  rename: (circle_id: string, name: string): Promise<CircleResponse> => axiosInstance.post<unknown, CircleResponse>(`/circles/${circle_id}`, { name }),

  // Delete a circle
  delete: (circle_id: string): Promise<any> => axiosInstance.post<unknown, any>(`/circles/${circle_id}/delete`),

  // Add the user to  a circle
  addUser: (user_id: string, circle_id: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/users/${user_id}/circles`, { circle_id, action: 'ADD' }),

  // Remove the user from a circle
  removeUser: (user_id: string, circle_id: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/users/${user_id}/circles`, { circle_id, action: 'REMOVE' }),

  // Add the group from a certain circle
  addGroup: (conversation_id: string, circle_id: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/conversations/${conversation_id}/circles`, { circle_id, action: 'ADD' }),

  // Remove the group from a certain circle
  removeGroup: (conversation_id: string, circle_id: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/conversations/${conversation_id}/circles`, { circle_id, action: 'REMOVE' }),

  // Get all the conversations in a circle of a user
  conversations: (circle_id: string, params: CircleRequest): Promise<CircleResponse[]> => axiosInstance.get<unknown, CircleResponse[]>(`/circles/${circle_id}/circles`, { params })
});

export const CircleClient = buildClient(CircleKeystoreClient);

export default CircleClient;
