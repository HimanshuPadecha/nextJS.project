import { Message } from "@/model/User"

export interface ApiResponse {
    success:boolean;
    message:string;
    isAcceptingMessages?:true;
    messages?:Array<Message>;
}