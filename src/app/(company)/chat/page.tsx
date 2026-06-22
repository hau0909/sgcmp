import { CompanyChat } from "@/features/chat/components/CompanyChat"

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-white flex flex-col">
      <CompanyChat />
    </div>
  )
}
