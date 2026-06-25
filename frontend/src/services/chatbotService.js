import api from "./api";

export const sendMessage = async(message)=>{

  return await api.post(
    "/chatbot/message",
    {
      message
    }
  );

};