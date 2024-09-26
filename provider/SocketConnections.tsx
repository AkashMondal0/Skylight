import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux-stores/store";
import { createContext, memo, useCallback, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { configs } from "@/configs";
import { ToastAndroid } from "react-native";
import { Typing, Notification, Message } from "@/types";
import { setMessage, setMessageSeen, setTyping } from "@/redux-stores/slice/conversation";
import { conversationSeenAllMessage, fetchConversationsApi } from "@/redux-stores/slice/conversation/api.service";
import { setNotification } from "@/redux-stores/slice/notification";
import {
    fetchUnreadMessageNotificationCountApi,
} from "@/redux-stores/slice/notification/api.service";
import debounce from "@/lib/debouncing";

export type SocketEmitType = "conversation_message" | "conversation_message_seen" | "conversation_user_keyboard_pressing" | "notification_post" | "conversation_list_refetch" | "test"
interface SocketStateType {
    socket: Socket | null
    sendDataToServer: (eventName: SocketEmitType, data: unknown) => void
    SocketConnection: () => void
}

export const SocketContext = createContext<SocketStateType>({
    socket: null,
    sendDataToServer: () => { },
    SocketConnection: () => { }
})

const SocketConnectionsProvider = memo(function SocketConnectionsProvider({
    children
}: {
    children: React.ReactNode
}) {
    const dispatch = useDispatch()
    const session = useSelector((state: RootState) => state.AuthState.session.user)
    const conversation = useSelector((state: RootState) => state.ConversationState.conversation)
    const list = useSelector((state: RootState) => state.ConversationState.conversationList)
    const socketRef = useRef<Socket | null>(null)

    async function SocketConnection() {
        if (session?.id && !socketRef.current) {
            socketRef.current = io(`${configs.serverApi.baseUrl.replace("/v1", "")}/chat`, {
                transports: ['websocket'],
                extraHeaders: {
                    Authorization: session.accessToken
                },
                query: {
                    userId: session.id,
                    username: session.username
                }
            })
        }
    }

    const seenAllMessage = debounce(async (conversationId: string) => {
        if (!conversationId || !session?.id || conversation?.id) return
        if (conversation?.id === conversationId) {
            dispatch(conversationSeenAllMessage({
                conversationId: conversation.id,
                authorId: session?.id,
            }) as any)
            socketRef.current?.emit(configs.eventNames.conversation.seen, {
                conversationId: conversation.id,
                authorId: session?.id,
                members: conversation.members?.filter((member) => member !== session?.id),
            })
        }
    }, 1500)

    useEffect(() => {
        SocketConnection()
        if (socketRef.current && session?.id) {
            socketRef.current?.on(configs.eventNames.conversation.message, (data: Message) => {
                if (data.authorId !== session?.id) {
                    if (list.find(conversation => conversation.id === data.conversationId)) {
                        dispatch(setMessage(data))
                    } else {
                        dispatch(fetchConversationsApi({
                            limit: 12,
                            offset: 0,
                        }) as any)
                    }
                    // dispatch(fetchUnreadMessageNotificationCountApi() as any)
                    seenAllMessage(data.conversationId)
                }
            });
            socketRef.current?.on(configs.eventNames.conversation.seen, (data: { conversationId: string, authorId: string }) => {
                if (data.authorId !== session?.id) {
                    dispatch(setMessageSeen(data))
                }
            });
            socketRef.current?.on(configs.eventNames.conversation.typing, (data: Typing) => {
                if (data.authorId !== session?.id) {
                    dispatch(setTyping(data))
                }
            });
            socketRef.current?.on(configs.eventNames.notification.post, (data: Notification) => {
                if (data.authorId !== session?.id) {
                    dispatch(setNotification(data))
                }
            });
            socketRef.current?.on("test", (data: Typing) => {
                ToastAndroid.show("Test from socket server", ToastAndroid.SHORT)
            });
            socketRef.current?.on("connect", () => {
                console.log("Connected to socket server")
            });
            socketRef.current?.on("disconnect", () => {
                socketRef.current = null
                console.warn("Disconnected from socket server")
            });
            return () => {
                socketRef.current?.off('connect')
                socketRef.current?.off('disconnect')
                socketRef.current?.off('test')
                socketRef.current?.off(configs.eventNames.conversation.message)
                socketRef.current?.off(configs.eventNames.conversation.seen)
                socketRef.current?.off(configs.eventNames.conversation.typing)
                socketRef.current?.off(configs.eventNames.notification.post)
            }
        }
    }, [session?.id, socketRef.current])


    const sendDataToServer = useCallback((eventName: SocketEmitType, data: unknown) => {
        if (socketRef.current) { socketRef.current.emit(eventName, data) }
    }, [])

    return <SocketContext.Provider value={{
        socket: socketRef.current,
        sendDataToServer,
        SocketConnection
    }}>
        {children}
    </SocketContext.Provider>
})


export default SocketConnectionsProvider;