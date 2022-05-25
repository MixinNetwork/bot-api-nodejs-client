import { AxiosInstance } from 'axios';
import { CircleResponse, CircleRequest, CircleConversationResponse } from './types/circle';
import { buildClient } from './utils/client';

export const CircleKeystoreClient = (axiosInstance: AxiosInstance) => ({
  // Get the details of a certain circle
  fetch: (circleID: string): Promise<CircleResponse> => axiosInstance.get<unknown, CircleResponse>(`/circles/${circleID}`),

  // Get all circles of a user
  fetchList: (): Promise<CircleResponse[]> => axiosInstance.get<unknown, CircleResponse[]>('/circles'),

  // Get all the conversations in a circle of a user
  conversations: (circleID: string, params: CircleRequest): Promise<CircleConversationResponse[]> => axiosInstance.get<unknown, CircleConversationResponse[]>(`/circles/${circleID}/conversations`, { params }),

  // Create a circle
  create: (name: string): Promise<CircleResponse> => axiosInstance.post<unknown, CircleResponse>('/circles', { name }),

  // Modify the circle name
  rename: (circleID: string, name: string): Promise<CircleResponse> => axiosInstance.post<unknown, CircleResponse>(`/circles/${circleID}`, { name }),

  // Delete a circle
  delete: (circleID: string): Promise<any> => axiosInstance.post<unknown, any>(`/circles/${circleID}/delete`),

  // Add the user to  a circle
  addUser: (userID: string, circleID: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/users/${userID}/circles`, { circleID, action: 'ADD' }),

  // Remove the user from a circle
  removeUser: (userID: string, circleID: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/users/${userID}/circles`, { circleID, action: 'REMOVE' }),

  // Add the group from a certain circle
  addGroup: (conversationID: string, circleID: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/conversations/${conversationID}/circles`, { circleID, action: 'ADD' }),

  // Remove the group from a certain circle
  removeGroup: (conversation_id: string, circleID: string): Promise<CircleResponse[]> => axiosInstance.post<unknown, CircleResponse[]>(`/conversations/${conversation_id}/circles`, { circleID, action: 'REMOVE' }),
});

export const CircleClient = buildClient(CircleKeystoreClient);

export default CircleClient;