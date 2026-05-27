export interface ResultMessage<T> {
  success: boolean;
  message: string;
  data?: T;
}